export default class Player {

    private observer: MutationObserver;

    private spinner: HTMLDivElement;
    private player: HTMLIFrameElement;

    constructor(channelName: string, private container: HTMLDivElement) {
        this.observer = new MutationObserver(this.onMutation.bind(this));

        // Create loading spinner
        this.spinner = document.createElement('div');
        this.spinner.className = 'tw-loading-spinner__circle';
        this.spinner.style.position = 'fixed';
        this.spinner.style.left = '46%';
        this.spinner.style.top = '45%';
        this.spinner.style.pointerEvents = 'none';
        container.append(this.spinner);

        // Create an iframe with the twitch player of the channel
        this.player = document.createElement('iframe');
        this.player.src = `https://player.twitch.tv/?autoplay=true&muted=true&channel=${channelName}`;
        this.player.allowFullscreen = false;
        this.player.width = container.clientWidth.toString();
        this.player.height = container.clientHeight.toString();
        this.player.style.display = 'none';
        this.player.style.pointerEvents = 'none';
        this.player.onload = () => {
            this.observer.observe(this.player.contentDocument!.body, { childList: true, subtree: true });
        };
        container.prepend(this.player);
    }

    public remove(): void {
        this.player.remove();
        this.spinner.remove();
    }

    private onMutation(mutations: MutationRecord[], observer: MutationObserver): void {
        for (const mutation of mutations) {
            for (const element of mutation.addedNodes) {
                // Remove overlay and show only error
                if (this.player.contentDocument!.getElementsByClassName('pl-error')[0]) {
                    for (const e of this.player.contentDocument!.getElementsByClassName('hover-display')) {
                        e.remove();
                    }
                    this.spinner.remove();
                    this.player.style.display = 'block';
                    observer.disconnect();
                    break;
                }

                if (this.player.contentDocument!.getElementById('mature-link')) {
                    // Dismiss mature warning
                    this.player.contentDocument!.getElementById('mature-link')!.click();
                } else if (element instanceof HTMLVideoElement) {
                    element.onplaying = () => {
                        // Remove ui and show player
                        this.player.contentDocument!.getElementsByClassName('player-ui')[0].remove();
                        this.spinner.remove();
                        this.player.style.display = 'block';
                        element.muted = true;
                        observer.disconnect();
                    };
                }
            }
        }
    }

}
