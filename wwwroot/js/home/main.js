let logout = false;

function progress(parent = "body", card = false) {
    const loader = $(`<div class="loading-container"><div><div class="mdl-spinner ${card ? "mdl-spinner-card" : ""} mdl-js-spinner is-active"></div></div></div>`);
    loader.appendTo(parent);
    loader.busy = true;

    componentHandler.upgradeElements($(".mdl-spinner").get());

    setTimeout(function () {
        loader.css({ opacity: 1 });
    }, 1);

    return {
        show: () => {
            loader.busy = true;
            loader.show();
            loader.css({ opacity: 1 });
        },
        hide: () => {
            loader.css({ opacity: 0 });

            setTimeout(function () {
                loader.hide();
                loader.busy = false;
            }, 400);
        },
        get busy() {
            return loader.busy;
        },
    };
}

function snackbar(message, timeout = 2000) {
    const toast = document.querySelector("#action-toast");
    toast.MaterialSnackbar.cleanup_();

    setTimeout(function () {
        toast.MaterialSnackbar.skipClearing++;
        toast.MaterialSnackbar.showSnackbar({ message: message, timeout: timeout });
    }, toast.MaterialSnackbar.Constant_.ANIMATION_LENGTH);
}

$("#logout").click(function () {
    if (logout) return;
    logout = true;

    snackbar("Logging out...");

    $.post("/api/auth/logout", function () {
        window.location.reload();
    });
});

$.post("/api/user/identity", function (data) {
    $("#username-load").fadeOut();

    setTimeout(function () {
        $("#username").html(data.Username).fadeIn();
    }, 250);
});