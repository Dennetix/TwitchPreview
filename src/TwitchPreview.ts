import Player from './Player';

class TwitchPreview {

    constructor() {
        const observer = new MutationObserver(this.onMutation.bind(this));
        observer.observe(document.body, { childList: true, subtree: true });
    }

    public onMutation(mutations: MutationRecord[], observer: MutationObserver): void {
        for (const mutation of mutations) {
            for (const element of mutation.addedNodes) {
                for (const card of (element as HTMLElement).getElementsByClassName('preview-card')) {
                    const thumbnailContainer = card.getElementsByClassName('preview-card-thumbnail__image')[0] as HTMLDivElement;
                    const channelName = card.getElementsByClassName('preview-card-titles__subtitle-wrapper')[0].firstChild!.textContent!.replace(/.*\((\w+)\)/, '$1');

                    // Check that this is a live stream and not a vod
                    const text = card.getElementsByClassName('preview-card-overlay')[0].textContent!.toLowerCase();
                    if (text.includes('live') || text.includes('rerun') || text.includes('hosting')) {
                        let player: Player;
                        thumbnailContainer.onmouseenter = () => {
                            player = new Player(channelName, thumbnailContainer);
                        };

                        thumbnailContainer.onmouseleave = () => {
                            player.remove();
                        };
                    }
                }
            }
        }
    }

}

new TwitchPreview();
