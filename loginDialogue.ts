import baseExtension = require("../coreplayer-shared-module/baseExtension");
import extension = require("../../extensions/wellcomeplayer-seadragon-extension/extension");
import shell = require("../coreplayer-shared-module/shell");
import utils = require("../../utils");
import dialogue = require("../coreplayer-shared-module/dialogue");
import IWellcomeExtension = require("../wellcomeplayer-shared-module/iWellcomeExtension");

export class LoginDialogue extends dialogue.Dialogue {

    $message: JQuery;
    $title: JQuery;
    $nextItemButton: JQuery;
    $usernameLabel: JQuery;
    $username: JQuery;
    $passwordLabel: JQuery;
    $password: JQuery;
    $forgotButton: JQuery;
    $registerButton: JQuery;
    $loginButton: JQuery;
    $socialLogins: JQuery;
    $socialLoginsTitle: JQuery;
    $signInWithTwitterButton: JQuery;
    $signInWithFacebookButton: JQuery;
    $signInWithGoogleButton: JQuery;
    $signInWithOpenIDButton: JQuery;

    successCallback: any;
    failureCallback: any;
    inadequatePermissions: boolean;
    requestedIndex: number;
    allowClose: boolean;
    message: string;

    static SHOW_LOGIN_DIALOGUE: string = 'onShowLoginDialogue';
    static HIDE_LOGIN_DIALOGUE: string = 'onHideLoginDialogue';
    static NEXT_ITEM: string = 'onNextItem';
    static LOGIN: string = 'onLogin';

    constructor($element: JQuery) {
        super($element);
    }

    create(): void {

        this.setConfig('loginDialogue');

        super.create();

        $.subscribe(LoginDialogue.SHOW_LOGIN_DIALOGUE, (e, params) => {
            this.open();
            this.successCallback = params.successCallback;
            this.failureCallback = params.failureCallback;
            this.inadequatePermissions = params.inadequatePermissions || false;
            this.requestedIndex = params.requestedIndex;
            this.allowClose = params.allowClose;
            this.message = params.message;

            // reset ui.
            this.$message.hide();
            this.$nextItemButton.hide();
            this.$socialLogins.show();

            this.$loginButton.removeClass('disabled');

            this.$loginButton.off('click').on('click', (e) => {
                e.preventDefault();

                this.login();
            });

            if (this.inadequatePermissions) {
                if (this.provider.pkg.assets.length > 1) {
                    this.$nextItemButton.show();
                }
                this.$socialLogins.hide();
            }

            if (this.message) {
                this.showMessage(this.message);
            } else {
                // show default message.
                this.showMessage(this.content.defaultMessage);
            }

            if (this.allowClose) {
                this.enableClose();
            } else {
                this.disableClose();
            }

            (<IWellcomeExtension>this.extension).trackEvent('Interactions', 'Log in', 'Opened', '');
        });

        $.subscribe(LoginDialogue.HIDE_LOGIN_DIALOGUE, (e) => {
            this.close();
        });

        // create ui.

        this.$title = $('<h1>' + this.content.title + '</h1>');
        this.$content.append(this.$title);

        this.$content.append('\
            <div class="main-login">\
                <p class="message"></p>\
                <a class="nextItem" href="#"></a>\
                <div>\
                    <label for="username"></label>\
                    <input type="text" name="username" id="username">\
                </div>\
                <div>\
                    <label for="password"></label>\
                    <input type="password" name="password" id="password">\
                </div>\
                <div class="main-login-buttons">\
                    <a class="forgot" href="#"></a>\
                    <a class="register" href="#"></a>\
                    <a class="button login"></a>\
                </div>\
            </div>\
            <div class="social-logins">\
                <h6></h6>\
                <a class="social-login twitter" href="/handlers/auth/Twitter.ashx">Twitter</a>\
                <a class="social-login facebook" href="/handlers/auth/Facebook.ashx">Facebook</a>\
                <a class="social-login google" href="/handlers/auth/Google.ashx">Google</a>\
                <a class="social-login openid" href="/login-openid/">OpenID</a>\
            </div>'
        );

        this.$message = this.$content.find(".message");

        this.$nextItemButton = this.$content.find(".nextItem");
        this.$nextItemButton.text(this.content.nextItem);

        this.$usernameLabel = this.$content.find("label[for='username']");
        this.$usernameLabel.text(this.content.usernameLabel);

        this.$username = this.$content.find('#username');
        this.$username.attr('tabindex', 1);

        this.$passwordLabel = this.$content.find("label[for='password']");
        this.$passwordLabel.text(this.content.passwordLabel);

        this.$password = this.$content.find('#password');
        this.$password.attr('tabindex', 2);

        this.$forgotButton = this.$content.find('a.forgot');
        this.$forgotButton.text(this.content.forgotPassword);
        this.$forgotButton.attr('tabindex', 4);

        this.$registerButton = this.$content.find('a.register');
        this.$registerButton.text(this.content.register);
        this.$registerButton.attr('tabindex', 5);

        this.$loginButton = this.$content.find('a.login');
        this.$loginButton.text(this.content.login);
        this.$loginButton.attr('tabindex', 3);

        this.$socialLogins = this.$content.find('.social-logins');

        this.$socialLoginsTitle = this.$content.find('.social-logins h6');
        this.$socialLoginsTitle.text(this.content.orLoginWith);

        this.$signInWithTwitterButton = this.$content.find('a.twitter');
        this.$signInWithTwitterButton.attr('tabindex', 6);

        this.$signInWithFacebookButton = this.$content.find('a.facebook');
        this.$signInWithFacebookButton.attr('tabindex', 7);

        this.$signInWithGoogleButton = this.$content.find('a.google');
        this.$signInWithGoogleButton.attr('tabindex', 8);

        this.$signInWithOpenIDButton = this.$content.find('a.openid');
        this.$signInWithOpenIDButton.attr('tabindex', 9);

        // initialise ui.

        // ui event handlers.
        var that = this;

        this.$nextItemButton.click((e) => {
            e.preventDefault();

            $.publish(LoginDialogue.NEXT_ITEM, [this.requestedIndex]);
        });

        this.$forgotButton.click((e) => {
            e.preventDefault();

            this.extension.redirect(this.options.forgotPasswordUri);
        });

        this.$registerButton.click((e) => {
            e.preventDefault();

            this.extension.redirect(this.options.registerUri);
        });

        this.$signInWithTwitterButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        this.$signInWithFacebookButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        this.$signInWithGoogleButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        this.$signInWithOpenIDButton.click(function(e){
            e.preventDefault();

            that.extension.redirect($(this).attr('href'));
        });

        this.$closeButton.on('click', () => {
            (<IWellcomeExtension>this.extension).trackEvent('Interactions', 'Log in', 'Closed', '');
        });

        this.returnFunc = () => {
            if (this.isActive){
                this.login();
            }
        }

        // hide
        this.$element.hide();
    }

    login(): void {

        this.$loginButton.unbind('click');
        this.$loginButton.addClass('disabled');

        var username = this.$username.val();
        var password = this.$password.val();

        $.publish(LoginDialogue.LOGIN, [
            {
                username: username,
                password: password,
                successCallback: this.successCallback,
                failureCallback: this.failureCallback
            }
        ]);
    }

    resize(): void {
        super.resize();
    }

    showMessage(message): void {
        this.$message.text(message);
        this.$message.show();
    }
}
