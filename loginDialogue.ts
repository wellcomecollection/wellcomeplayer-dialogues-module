import baseExtension = require("../coreplayer-shared-module/baseExtension");
import extension = require("../../extensions/wellcomeplayer-seadragon-extension/extension");
import shell = require("../coreplayer-shared-module/shell");
import utils = require("../../utils");
import dialogue = require("../coreplayer-shared-module/dialogue");
import IWellcomeExtension = require("../wellcomeplayer-shared-module/iWellcomeExtension");

export class LoginDialogue extends dialogue.Dialogue {

    allowClose: boolean;
    allowGuestLogin: boolean;
    allowSocialLogin: boolean;
    failureCallback: any;
    inadequatePermissions: boolean;
    message: string;
    requestedIndex: number;
    successCallback: any;
    title: string;

    $acceptTermsButton: JQuery;
    $facebookLoginButton: JQuery;
    $googleLoginButton: JQuery;
    $guestLogin: JQuery;
    $libraryLogin: JQuery;
    $libraryLoginButton: JQuery;
    $message: JQuery;
    $nextItemButton: JQuery;
    $openIDLoginButton: JQuery;
    $socialLogin: JQuery;
    //$socialLoginsTitle: JQuery;
    $title: JQuery;
    $twitterLoginButton: JQuery;
    $viewTermsButton: JQuery;

    static SHOW_LOGIN_DIALOGUE: string = 'onShowLoginDialogue';
    static HIDE_LOGIN_DIALOGUE: string = 'onHideLoginDialogue';
    static NEXT_ITEM: string = 'onNextItem';
    static LOGIN: string = 'onLogin';

    constructor($element: JQuery) {
        super($element);
    }

    create(): void {

        var that = this;

        this.setConfig('loginDialogue');

        super.create();

        $.subscribe(LoginDialogue.SHOW_LOGIN_DIALOGUE, (e, params) => {
            that.open();
            that.allowClose = params.allowClose;
            that.allowGuestLogin = params.allowGuestLogin || false;
            that.allowSocialLogin = params.allowSocialLogin || false;
            that.failureCallback = params.failureCallback;
            that.inadequatePermissions = params.inadequatePermissions || false;
            that.message = params.message;
            that.requestedIndex = params.requestedIndex;
            that.successCallback = params.successCallback;
            that.title = params.title;

            // reset ui.
            that.$message.hide();
            that.$nextItemButton.hide();
            that.$guestLogin.hide();
            that.$libraryLogin.hide();
            that.$socialLogin.hide();

            if (that.inadequatePermissions) {
                if (that.provider.getTotalCanvases() > 1) {
                    that.$nextItemButton.show();
                }
                that.$libraryLogin.show();
            }

            if (that.allowGuestLogin){
                that.$guestLogin.show();
            } else {
                that.$libraryLogin.show();
            }

            if (that.allowSocialLogin){
                that.$socialLogin.show();
            }

            if (that.title){
                that.setTitle(that.title);
            } else {
                that.setTitle(that.content.title);
            }

            if (that.message) {
                that.showMessage(that.message);
            } else {
                // show default message.
                that.showMessage(that.content.defaultMessage);
            }

            if (that.allowClose) {
                that.enableClose();
            } else {
                that.disableClose();
            }

            // this has to be set here, as on click is too late to add querystring params.
            var uri = escape(parent.document.URL);

            that.$acceptTermsButton.attr('href', that.options.acceptTermsUri + '?redirectUrl=' + uri);
            //that.$libraryLoginButton.attr('href', '/handlers/auth/CasSSO.ashx?redirectUrl=' + uri);
            //that.$facebookLoginButton.attr('href', '/handlers/auth/Facebook.ashx?redirectUrl=' + uri);
            //that.$twitterLoginButton.attr('href', '/handlers/auth/Twitter.ashx?redirectUrl=' + uri);
            //that.$openIDLoginButton.attr('href', '/login-openid/?redirectUrl=' + uri);
            //that.$googleLoginButton.attr('href', '/handlers/auth/Google.ashx?redirectUrl=' + uri);
        });

        $.subscribe(LoginDialogue.HIDE_LOGIN_DIALOGUE, (e) => {
            this.close();
        });

        // create ui.

        this.$title = $('<h1></h1>');
        this.$content.append(this.$title);

        this.$content.append('\
            <div class="main-login">\
                <p class="message"></p>\
                <a class="nextItem" href="#"></a>\
                <div class="guestLogin">\
                    <a class="viewTerms" href="#"></a>\
                    <a class="acceptTerms button" href="#" target="_parent"></a>\
                </div>\
                <div class="libraryLogin">\
                    <a class="button" href="/handlers/auth/CasSSO.ashx"></a>\
                </div>\
                <div class="socialLogin">\
                    <a class="twitter" href="/handlers/auth/Twitter.ashx">Twitter</a>\
                    <a class="facebook" href="/handlers/auth/Facebook.ashx">Facebook</a>\
                    <a class="google" href="/handlers/auth/Google.ashx">Google</a>\
                    <a class="openid" href="/login-openid/">OpenID</a>\
                </div>\
            </div>'
        );

        this.$message = this.$content.find(".message");

        this.$guestLogin = this.$content.find(".guestLogin");
        this.$libraryLogin = this.$content.find(".libraryLogin");
        this.$socialLogin = this.$content.find(".socialLogin");

        this.$nextItemButton = this.$content.find(".nextItem");
        this.$nextItemButton.text(this.content.nextItem);

        this.$viewTermsButton = this.$guestLogin.find(".viewTerms");
        this.$viewTermsButton.text(this.content.viewTerms);

        this.$acceptTermsButton = this.$guestLogin.find(".acceptTerms");
        this.$acceptTermsButton.text(this.content.acceptTerms);

        this.$libraryLoginButton = this.$libraryLogin.find('.button');
        this.$libraryLoginButton.text(this.content.login);

        //this.$socialLoginsTitle = this.$socialLogin.find('h6');
        //this.$socialLoginsTitle.text(this.content.socialLoginsTitle);

        this.$twitterLoginButton = this.$socialLogin.find('a.twitter');
        this.$twitterLoginButton.text(this.content.twitter);
        this.$twitterLoginButton.attr('tabindex', 7);

        this.$facebookLoginButton = this.$socialLogin.find('a.facebook');
        this.$facebookLoginButton.text(this.content.facebook);
        this.$facebookLoginButton.attr('tabindex', 8);

        this.$googleLoginButton = this.$socialLogin.find('a.google');
        this.$googleLoginButton.text(this.content.google);
        this.$googleLoginButton.attr('tabindex', 9);

        this.$openIDLoginButton = this.$socialLogin.find('a.openid');
        this.$openIDLoginButton.text(this.content.openid);
        this.$openIDLoginButton.attr('tabindex', 10);

        // initialise ui.

        // ui event handlers.
        var that = this;

        this.$nextItemButton.click((e) => {
            e.preventDefault();

            $.publish(LoginDialogue.NEXT_ITEM, [this.requestedIndex]);
        });

        this.$viewTermsButton.click((e) => {
            e.preventDefault();

            this.$message.empty();
            this.$message.addClass('loading');
            this.$message.load(this.options.termsUri, () => {
                this.$message.removeClass('loading');
                this.$message.find('a').prop('target', '_blank');
                this.$viewTermsButton.hide();
            });
        });

        this.$libraryLoginButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        this.$twitterLoginButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        this.$facebookLoginButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        this.$googleLoginButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        this.$openIDLoginButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        // hide
        this.$element.hide();
    }

    resize(): void {
        super.resize();
    }

    setTitle(title: string): void{
        this.$title.html(title);
    }

    showMessage(message): void {
        this.$message.html(message);
        this.$message.show();
    }
}
