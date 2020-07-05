import { Player } from './Player';

class TwitchPreview {

    constructor() {
        const observer = new MutationObserver(this.onMutation.bind(this));
        observer.observe(document.body, { childList: true, subtree: true });
    }

    public onMutation(mutations: MutationRecord[]): void {
        for (const mutation of mutations) {
            for (const element of mutation.addedNodes) {
                if ((element as HTMLElement).nodeName !== '#text') {
                    const cardImageContainers = (element as HTMLElement).querySelectorAll("[data-a-target='preview-card-image-link']");
                    for (const cardImageContainer of cardImageContainers) {
                        // Search DOM backwards until article is found
                        let card = cardImageContainer;
                        while (card.localName !== 'article') {
                            card = card.parentElement!;
                        }

                        const thumbnailContainer = cardImageContainer.getElementsByClassName('tw-aspect--align-top')[0] as HTMLDivElement;
                        const channelName = card.querySelector("[data-a-target='preview-card-channel-link']")!.textContent!.replace(/.*\((\w+)\)/, '$1');

                        // Make sure that this is a livestream, rerun or host and not a VOD
                        let indicator = card.getElementsByClassName('tw-channel-status-text-indicator')[0];
                        indicator = indicator || card.getElementsByClassName('stream-type-indicator')[0];
                        if (!indicator) {
                            continue;
                        }
                        const status = indicator.textContent!.toLowerCase();
                        if (status.includes('live') || status.includes('rerun') || status.includes('hosting')) {
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

}

new TwitchPreview();
