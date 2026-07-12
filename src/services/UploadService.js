import ApiClient from './ApiClient';

const UploadService = {
    /**
     * Uploads any local (data-URI) images to the backend and returns an array
     * where each local image is replaced by its permanent server URL.
     * Already-hosted (http/https) images pass through untouched; legacy
     * device-only file:// paths are dropped since no other device can load them.
     */
    async uploadLocalImages(images = []) {
        const results = [];
        for (const img of images) {
            if (typeof img !== 'string') continue;
            if (img.startsWith('http://') || img.startsWith('https://')) {
                results.push(img);
            } else if (img.startsWith('data:image/')) {
                const { url } = await ApiClient.post('/uploads', { data: img });
                results.push(url);
            }
            // file:// URIs are intentionally skipped — they never worked cross-device.
        }
        return results;
    },
};

export default UploadService;
