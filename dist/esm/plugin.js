var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Plugins } from '@capacitor/core';
import { ScriptInjectionTime } from './definitions';
const { WebviewOverlayPlugin } = Plugins;
import ResizeObserver from 'resize-observer-polyfill';
export class WebviewOverlay {
    open(options) {
        this.element = options.element;
        if (this.element && this.element.style) {
            this.element.style.backgroundSize = 'cover';
            this.element.style.backgroundRepeat = 'no-repeat';
            this.element.style.backgroundPosition = 'center';
        }
        const boundingBox = this.element.getBoundingClientRect();
        this.updateSnapshotEvent = WebviewOverlayPlugin.addListener('updateSnapshot', () => {
            setTimeout(() => {
                this.toggleSnapshot(true);
            }, 100);
        });
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const _entry of entries) {
                const boundingBox = options.element.getBoundingClientRect();
                WebviewOverlayPlugin.updateDimensions({
                    width: Math.round(boundingBox.width),
                    height: Math.round(boundingBox.height),
                    x: Math.round(boundingBox.x),
                    y: Math.round(boundingBox.y)
                });
            }
        });
        this.resizeObserver.observe(this.element);
        return WebviewOverlayPlugin.open({
            url: options.url,
            javascript: options.script ? options.script.javascript : '',
            injectionTime: options.script ? (options.script.injectionTime || ScriptInjectionTime.atDocumentStart) : ScriptInjectionTime.atDocumentStart,
            width: Math.round(boundingBox.width),
            height: Math.round(boundingBox.height),
            x: Math.round(boundingBox.x),
            y: Math.round(boundingBox.y)
        });
    }
    close() {
        this.element = undefined;
        this.resizeObserver.disconnect();
        if (this.updateSnapshotEvent) {
            this.updateSnapshotEvent.remove();
        }
        if (this.pageLoadedEvent) {
            this.pageLoadedEvent.remove();
        }
        if (this.progressEvent) {
            this.progressEvent.remove();
        }
        if (this.navigationHandlerEvent) {
            this.navigationHandlerEvent.remove();
        }
        return WebviewOverlayPlugin.close();
    }
    toggleSnapshot(snapshotVisible) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const snapshot = (yield WebviewOverlayPlugin.getSnapshot()).src;
                if (snapshotVisible) {
                    if (snapshot) {
                        const buffer = yield (yield fetch('data:image/jpeg;base64,' + snapshot)).arrayBuffer();
                        const blob = new Blob([buffer], { type: 'image/jpeg' });
                        const blobUrl = URL.createObjectURL(blob);
                        const img = new Image();
                        img.onload = () => __awaiter(this, void 0, void 0, function* () {
                            if (this.element && this.element.style) {
                                this.element.style.backgroundImage = `url(${blobUrl})`;
                            }
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                yield WebviewOverlayPlugin.hide();
                                resolve();
                            }), 25);
                        });
                        img.src = blobUrl;
                    }
                    else {
                        if (this.element && this.element.style) {
                            this.element.style.backgroundImage = `none`;
                        }
                        yield WebviewOverlayPlugin.hide();
                        resolve();
                    }
                }
                else {
                    if (this.element && this.element.style) {
                        this.element.style.backgroundImage = `none`;
                    }
                    yield WebviewOverlayPlugin.show();
                    resolve();
                }
            }));
        });
    }
    evaluateJavaScript(javascript) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield WebviewOverlayPlugin.evaluateJavaScript({
                javascript
            })).result;
        });
    }
    onPageLoaded(listenerFunc) {
        this.pageLoadedEvent = WebviewOverlayPlugin.addListener('pageLoaded', listenerFunc);
    }
    onProgress(listenerFunc) {
        this.progressEvent = WebviewOverlayPlugin.addListener('progress', listenerFunc);
    }
    handleNavigation(listenerFunc) {
        this.navigationHandlerEvent = WebviewOverlayPlugin.addListener('navigationHandler', (event) => {
            const complete = (allow) => {
                WebviewOverlayPlugin.handleNavigationEvent({ allow });
            };
            listenerFunc(Object.assign(Object.assign({}, event), { complete }));
        });
    }
    toggleFullscreen() {
        WebviewOverlayPlugin.toggleFullscreen();
    }
    goBack() {
        WebviewOverlayPlugin.goBack();
    }
    goForward() {
        WebviewOverlayPlugin.goForward();
    }
    reload() {
        WebviewOverlayPlugin.reload();
    }
    loadUrl(url) {
        return WebviewOverlayPlugin.loadUrl({ url });
    }
}
//# sourceMappingURL=plugin.js.map