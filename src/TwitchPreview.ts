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
                    const cardImageContainers = (element as HTMLElement).getElementsByClassName('preview-card-image-link') as HTMLCollectionOf<HTMLAnchorElement>;
                    for (const cardImageContainer of cardImageContainers) {
                        const thumbnailContainer = cardImageContainer.getElementsByTagName('img')[0].parentElement as HTMLDivElement;
                        const channelName = cardImageContainer.pathname.slice(1);

                        // Make sure that this is a livestream, rerun or host and not a VOD
                        const indicator = cardImageContainer.getElementsByClassName('tw-channel-status-text-indicator')[0]
                            || cardImageContainer.getElementsByClassName('stream-type-indicator')[0];
                        if (indicator) {
                            const status = indicator.textContent!.toLowerCase();
                            if (status.includes('live') || status.includes('rerun') || status.includes('hosting')) {
                                let player: Player | undefined;
                                thumbnailContainer.onmouseenter = () => {
                                    player = new Player(channelName, thumbnailContainer);
                                };
                                thumbnailContainer.onmouseleave = () => {
                                    if (player) {
                                        player.remove();
                                        player = undefined;
                                    }
                                };
                            }
                        }
                    }

                    // Search result cards
                    const searchResultCards = (element as HTMLElement).querySelectorAll("[data-a-target='search-result-live-channel']");
                    for (const searchResultCard of searchResultCards) {
                        const thumbnailContainer = searchResultCard.getElementsByClassName('search-result-card__img-wrapper')[0] as HTMLDivElement;
                        const channelName = searchResultCard.getElementsByTagName('a')[0].pathname.slice(1);

                        let player: Player | undefined;
                        (searchResultCard as HTMLElement).onmouseenter = () => {
                            player = new Player(channelName, thumbnailContainer);
                        };
                        (searchResultCard as HTMLElement).onmouseleave = () => {
                            if (player) {
                                player.remove();
                                player = undefined;
                            }
                        };
                    }

                    // Search results related streams
                    const searchResultRelatedCards = (element as HTMLElement).getElementsByClassName('search-result-related-live-channels__row-container')[0];
                    if (searchResultRelatedCards) {
                        for (const searchResultRelatedCard of searchResultRelatedCards.getElementsByTagName('article')) {
                            const thumbnailContainer = searchResultRelatedCard.getElementsByTagName('img')[0].parentElement as HTMLDivElement;
                            const channelName = searchResultRelatedCard.getElementsByTagName('a')[0].pathname.slice(1);

                            let player: Player | undefined;
                            searchResultRelatedCard.onmouseenter = () => {
                                player = new Player(channelName, thumbnailContainer);
                            };
                            searchResultRelatedCard.onmouseleave = () => {
                                if (player) {
                                    player.remove();
                                    player = undefined;
                                }
                            };
                        }
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

                    const sidebarTooltip = (element as HTMLElement).getElementsByClassName('online-side-nav-channel-tooltip__body')[0] as HTMLDivElement;
                    if (sidebarTooltip && !this.sidebarTooltip) {
                        this.sidebarTooltip = sidebarTooltip;
                        if (this.hoveredSidebarChannel) {
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
        container.style.width = '320px';
        container.style.height = '180px';
        container.style.background = 'black';
        tooltip.style.paddingBottom = '6px';
        tooltip.append(container);

        const channelName = channel.getElementsByTagName('a')[0].pathname.slice(1);

        const thumbnail = document.createElement('img');
        thumbnail.src = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}-320x180.jpg`;
        thumbnail.width = 320;
        thumbnail.height = 180;
        container.append(thumbnail);

        let player: Player | undefined = new Player(channelName, container);
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
