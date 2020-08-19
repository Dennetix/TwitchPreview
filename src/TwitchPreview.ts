import { Player } from './Player';

class TwitchPreview {

    private hoveredSidebarChannel: HTMLDivElement | undefined;
    private sidebarTooltip: HTMLDivElement | undefined;

    constructor() {
        const observer = new MutationObserver(this.onMutation.bind(this));
        observer.observe(document.body, { childList: true, subtree: true });
    }

    public onMutation(mutations: MutationRecord[]): void {
        for (const mutation of mutations) {
            for (const element of mutation.addedNodes) {
                if ((element as HTMLElement).nodeName !== '#text') {
                    // Livestream preview cards
                    const cardImageContainers = (element as HTMLElement).querySelectorAll("[data-a-target='preview-card-image-link']");
                    for (const cardImageContainer of cardImageContainers) {
                        // Search DOM backwards until article is found
                        let card = cardImageContainer;
                        while (card.localName !== 'article') {
                            card = card.parentElement!;
                        }

                        const thumbnailContainer = cardImageContainer.getElementsByTagName('img')[0].parentElement as HTMLDivElement;
                        const channelName = card.querySelector("[data-a-target='preview-card-channel-link']")!.textContent!.replace(/.*\((\w+)\)/, '$1');

                        // Make sure that this is a livestream, rerun or host and not a VOD
                        let indicator = card.getElementsByClassName('tw-channel-status-text-indicator')[0];
                        indicator = indicator || card.getElementsByClassName('stream-type-indicator')[0];
                        if (!indicator) {
                            continue;
                        }
                        const status = indicator.textContent!.toLowerCase();
                        if (status.includes('live') || status.includes('rerun') || status.includes('hosting')) {
                            let player: Player | undefined;
                            thumbnailContainer.onmouseenter = () => {
                                player = new Player(channelName, thumbnailContainer, true);
                            };
                            thumbnailContainer.onmouseleave = () => {
                                if (player) {
                                    player.remove();
                                    player = undefined;
                                }
                            };
                        }
                    }

                    // Search result cards
                    const searchResultCards = (element as HTMLElement).querySelectorAll("[data-a-target='search-result-live-channel']");
                    for (const searchResultCard of searchResultCards) {
                        const thumbnailContainer = searchResultCard.getElementsByClassName('search-result-card__img-wrapper')[0] as HTMLDivElement;
                        const channelName = searchResultCard.getElementsByTagName('a')[0].pathname.slice(1);

                        let player: Player | undefined;
                        (searchResultCard as HTMLElement).onmouseenter = () => {
                            player = new Player(channelName, thumbnailContainer, false);
                        };
                        (searchResultCard as HTMLElement).onmouseleave = () => {
                            if (player) {
                                player.remove();
                                player = undefined;
                            }
                        };
                    }

                    // Sidebar nav cards
                    const sideNavCards = (element as HTMLElement).getElementsByClassName('side-nav-card');
                    for (const sideNavCard of sideNavCards) {
                        (sideNavCard as HTMLElement).onmouseenter = () => {
                            this.hoveredSidebarChannel = sideNavCard as HTMLDivElement;
                            if (this.sidebarTooltip && sideNavCard.getElementsByClassName('side-nav-card__live-status')[0].textContent !== 'Offline') {
                                this.addSidebarPreview(this.hoveredSidebarChannel, this.sidebarTooltip);
                            }
                        };
                    }

                    const sidebarTooltip = (element as HTMLElement).getElementsByClassName('rich-content-tooltip__pointer-target')[0] as HTMLDivElement;
                    if (sidebarTooltip) {
                        (document.getElementsByClassName('tooltip-layer')[0] as HTMLDivElement).style.zIndex = '9999';
                        this.sidebarTooltip = sidebarTooltip;
                        if (this.hoveredSidebarChannel && sidebarTooltip.getElementsByClassName('online-side-nav-channel-tooltip__body').length > 0) {
                            this.addSidebarPreview(this.hoveredSidebarChannel, this.sidebarTooltip);
                        }
                    }
                }
            }

            for (const element of mutation.removedNodes) {
                if ((element as HTMLElement).nodeName !== '#text') {
                    const sidebarTooltip = (element as HTMLElement).getElementsByClassName('online-side-nav-channel-tooltip__body')[0] as HTMLDivElement;
                    if (sidebarTooltip) {
                        this.sidebarTooltip = undefined;
                    }
                }
            }
        }
    }

    private addSidebarPreview(channel: HTMLDivElement, tooltip: HTMLDivElement): void {
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '256px';
        container.style.height = '144px';
        container.style.background = 'black';
        container.style.margin = '0 9px 0 9px';
        tooltip.style.paddingBottom = '9px';
        tooltip.append(container);

        const channelName = channel.getElementsByTagName('a')[0].pathname.slice(1);

        const thumbnail = document.createElement('img');
        thumbnail.src = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}-256x144.jpg`;
        thumbnail.width = 256;
        thumbnail.height = 144;
        container.append(thumbnail);

        let player: Player | undefined = new Player(channelName, container, false);
        channel.onmouseleave = () => {
            if (player) {
                player.remove();
                player = undefined;
            }
            container.remove();
        };
    }

}

new TwitchPreview();
