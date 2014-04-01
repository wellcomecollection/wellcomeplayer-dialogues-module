import baseExtension = require("../coreplayer-shared-module/baseExtension");
import extension = require("../../extensions/wellcomeplayer-seadragon-extension/extension");
import shell = require("../coreplayer-shared-module/shell");
import utils = require("../../utils");
import dialogue = require("../coreplayer-shared-module/dialogue");
import provider = require("../../extensions/wellcomeplayer-seadragon-extension/provider");

export class DownloadDialogue extends dialogue.Dialogue {

    $title: JQuery;
    $downloadOptions: JQuery;
    $currentViewAsJpgButton: JQuery;
    $wholeImageHighResAsJpgButton: JQuery;
    $wholeImageLowResAsJpgButton: JQuery;
    $entireDocumentAsPdfButton: JQuery;
    $buttonsContainer: JQuery;
    $previewButton: JQuery;
    $downloadButton: JQuery;

    static SHOW_DOWNLOAD_DIALOGUE: string = 'onShowDownloadDialogue';
    static HIDE_DOWNLOAD_DIALOGUE: string = 'onHideDownloadDialogue';
    static DOWNLOAD: string = 'onDownload';
    static PREVIEW: string = 'onPreview';

    isOpened: boolean = false;

    constructor($element: JQuery) {
        super($element);
    }

    create(): void {

        this.setConfig('downloadDialogue');

        super.create();

        $.subscribe(DownloadDialogue.SHOW_DOWNLOAD_DIALOGUE, (e, params) => {
            this.open();
            this.opened();
        });

        $.subscribe(DownloadDialogue.HIDE_DOWNLOAD_DIALOGUE, (e) => {
            this.close();
        });

        // create ui.
        this.$title = $('<h1>' + this.content.title + '</h1>');
        this.$content.append(this.$title);

        this.$downloadOptions = $('<ol class="options"></ol>');
        this.$content.append(this.$downloadOptions);

        this.$currentViewAsJpgButton = $('<li><input id="currentViewAsJpg" type="radio" name="downloadOptions"></input><label for="currentViewAsJpg">' + this.content.currentViewAsJpg + '</label></li>');
        this.$downloadOptions.append(this.$currentViewAsJpgButton);
        this.$currentViewAsJpgButton.hide();

        this.$wholeImageHighResAsJpgButton = $('<li><input id="wholeImageHighResAsJpg" type="radio" name="downloadOptions"></input><label for="wholeImageHighResAsJpg">' + this.content.wholeImageHighResAsJpg + '</label></li>');
        this.$downloadOptions.append(this.$wholeImageHighResAsJpgButton);
        this.$wholeImageHighResAsJpgButton.hide();

        this.$wholeImageLowResAsJpgButton = $('<li><input id="wholeImageLowResAsJpg" type="radio" name="downloadOptions"></input><label for="wholeImageLowResAsJpg">' + this.content.wholeImageLowResAsJpg + '</label></li>');
        this.$downloadOptions.append(this.$wholeImageLowResAsJpgButton);
        this.$wholeImageLowResAsJpgButton.hide();

        this.$entireDocumentAsPdfButton = $('<li><input id="entireDocumentAsPdf" type="radio" name="downloadOptions"></input><label for="entireDocumentAsPdf">' + this.content.entireDocumentAsPdf + '</label></li>');
        this.$downloadOptions.append(this.$entireDocumentAsPdfButton);
        this.$entireDocumentAsPdfButton.hide();

        this.$buttonsContainer = $('<div class="buttons"></div>');
        this.$content.append(this.$buttonsContainer);

        this.$previewButton = $('<a class="button" href="#">' + this.content.preview + '</a>');
        this.$buttonsContainer.append(this.$previewButton);

        this.$downloadButton = $('<a class="button" href="#">' + this.content.download + '</a>');
        this.$buttonsContainer.append(this.$downloadButton);

        var that = this;

        // ui event handlers.
        this.$previewButton.on('click', () => {
            var selectedOption = this.getSelectedOption();

            var id = selectedOption.attr('id');
            var asset = (<extension.Extension>that.extension).getCurrentAsset();

            switch (id){
                case 'currentViewAsJpg':
                    window.open((<extension.Extension>that.extension).getCropUri(false));
                    $.publish(DownloadDialogue.PREVIEW, ['currentViewAsJpg']);
                break;
                case 'wholeImageHighResAsJpg':
                    window.open((<provider.Provider>that.provider).getImage(asset, true));
                    $.publish(DownloadDialogue.PREVIEW, ['wholeImageHighResAsJpg']);
                break;
                case 'wholeImageLowResAsJpg':
                    window.open((<provider.Provider>that.provider).getImage(asset, false));
                    $.publish(DownloadDialogue.PREVIEW, ['wholeImageLowResAsJpg']);
                break;
                case 'entireDocumentAsPdf':
                    window.open((<provider.Provider>that.provider).getPDF());
                    $.publish(DownloadDialogue.PREVIEW, ['entireDocumentAsPdf']);
                break;
            }

            this.close();
        });

        this.$downloadButton.on('click', () => {
            var selectedOption = that.getSelectedOption();

            var id = selectedOption.attr('id');
            var asset = (<extension.Extension>that.extension).getCurrentAsset();

            switch (id){
                case 'currentViewAsJpg':
                    var viewer = (<extension.Extension>that.extension).getViewer();
                    window.open((<provider.Provider>that.provider).getCrop(asset, viewer, true));
                    $.publish(DownloadDialogue.DOWNLOAD, ['currentViewAsJpg']);
                break;
                case 'wholeImageHighResAsJpg':
                    window.open((<provider.Provider>that.provider).getImage(asset, true, true));
                    $.publish(DownloadDialogue.DOWNLOAD, ['wholeImageHighResAsJpg']);
                break;
                case 'wholeImageLowResAsJpg':
                    window.open((<provider.Provider>that.provider).getImage(asset, false, true));
                    $.publish(DownloadDialogue.DOWNLOAD, ['wholeImageLowResAsJpg']);
                break;
                case 'entireDocumentAsPdf':
                    window.open((<provider.Provider>that.provider).getPDF(true));
                    $.publish(DownloadDialogue.DOWNLOAD, ['entireDocumentAsPdf']);
                break;
            }

            this.close();
        });

        // hide
        this.$element.hide();
    }

    opened() {
        if (this.isOpened) return;

        this.isOpened = true;

        // enable download based on license code.
        if (this.isDownloadOptionAvailable("currentViewAsJpg")) {
            this.$currentViewAsJpgButton.show();
        }

        if (this.isDownloadOptionAvailable("wholeImageHighResAsJpg")) {
            this.$wholeImageHighResAsJpgButton.show();
        }

        if (this.isDownloadOptionAvailable("wholeImageLowResAsJpg")) {
            this.$wholeImageLowResAsJpgButton.show();
        }

        if (this.isDownloadOptionAvailable("entireDocumentAsPdf")) {
            this.$entireDocumentAsPdfButton.show();
        }

        if (this.isDownloadOptionAvailable("entireFileAsOriginal")) {
            var asset = this.extension.getCurrentAsset();

            var fileExtension = this.getFileExtension(asset.fileUri);

            if (fileExtension !== 'jp2'){

                // if no sources are available, use original (mp3 or mp4)
                if (!asset.sources){
                    this.addEntireFileDownloadOption(asset.fileUri);
                } else {
                    for (var i = 0; i < asset.sources.length; i++){
                        this.addEntireFileDownloadOption(asset.sources[i].src);
                    }
                }

                this.$downloadButton.hide();
                this.$previewButton.hide();
            }
        }

        // select first option.
        this.$downloadOptions.find('input:first').prop("checked", true);

        this.resize();
    }

    addEntireFileDownloadOption(fileUri: string): void{
        this.$downloadOptions.append('<li><a href="' + fileUri + '" target="_blank" download>' + String.prototype.format(this.content.entireFileAsOriginal, this.getFileExtension(fileUri)) + '</li>');
    }

    getFileExtension(fileUri: string): string{
        return fileUri.split('.').pop();
    }

    getSelectedOption() {
        return this.$downloadOptions.find("input:checked");
    }

    isDownloadOptionAvailable(option): boolean {
        return this.provider.assetSequence.extensions.permittedOperations.contains(option);
    }

    resize(): void {

        this.$element.css({
            'top': this.extension.height() - this.$element.outerHeight(true)
        });
    }
}
