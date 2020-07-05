import * as Hls from 'hls.js';

export class Player {

    private hls: Hls;

    private spinner: HTMLDivElement;
    private video: HTMLVideoElement;

    constructor(channelName: string, private container: HTMLDivElement, private highRes: boolean) {
        this.hls = new Hls();
        this.hls.on(Hls.Events.ERROR, (event, error) => {
            console.error(error);
        });

        // Get and load hls stream
        const clientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
        fetch(`https://api.twitch.tv/api/channels/${channelName}/access_token?client_id=${clientId}`)
            .then(res => res.json() as Promise<{[key: string]: string}>)
            .then(res => (
                fetch(`https://usher.ttvnw.net/api/channel/hls/${channelName.toLowerCase()}.m3u8?client_id=${clientId}&token=${res.token}&sig=${res.sig}`)
            ))
            .then(res => res.text())
            .then(res => this.hls.loadSource(this.parsePlaylist(res)))
            .catch(err => console.error(err));

        // Create video element
        this.video = document.createElement('video');
        this.hls.attachMedia(this.video);
        this.video.width = container.clientWidth;
        this.video.height = container.clientHeight;
        this.video.muted = true;
        this.video.controls = false;
        this.video.style.display = 'none';
        this.video.style.pointerEvents = 'none';
        this.video.oncanplay = () => {
            this.spinner.remove();
            void this.video.play();
            this.video.style.display = 'block';
            container.getElementsByTagName('img')[0].style.display = 'none';
        };
        container.insertBefore(this.video, container.firstChild);

        // Create loading spinner
        const spinnerAnim = document.createElement('style');
        spinnerAnim.innerHTML = `
            @keyframes spinner-anim {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.append(spinnerAnim);

        this.spinner = document.createElement('div');
        this.spinner.style.minHeight = '2.5rem';
        this.spinner.style.width = '2.5rem';
        this.spinner.style.height = '2.2rem';
        this.spinner.style.border = '2px solid rgba(128, 128, 128, 0.3)';
        this.spinner.style.borderLeft = '2px solid #d9d8dd';
        this.spinner.style.borderRadius = '50%';
        this.spinner.style.position = 'absolute';
        this.spinner.style.pointerEvents = 'none';
        this.spinner.style.animation = 'spinner-anim 1s infinite linear';
        container.append(this.spinner);
        this.spinner.style.left = `${(container.clientWidth / 2) - (this.spinner.clientWidth / 2)}px`;
        this.spinner.style.top = `${(container.clientHeight / 2) - (this.spinner.clientHeight / 2)}px`;
    }

    public remove(): void {
        this.container.getElementsByTagName('img')[0].style.display = 'block';
        this.hls.destroy();
        this.spinner.remove();
        this.video.remove();
    }

    private parsePlaylist(playlist: string): string {
        if (playlist.includes('VIDEO="chunked"')) {
            return playlist.split('VIDEO="chunked"\n')[1].split('m3u8')[0];
        } else if (this.highRes) {
            return playlist.split('VIDEO="360p30"\n')[1].split('m3u8')[0];
        }
        return playlist.split('VIDEO="160p30"\n')[1].split('m3u8')[0];
    }

}
