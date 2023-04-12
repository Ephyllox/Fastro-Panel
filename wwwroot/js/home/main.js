let logout = true;

function showLoading(parent = "body", card = false) {
    $(".loading-container").remove();
    $(`<div id="loader" class="loading-container"><div><div class="mdl-spinner ${card ? "mdl-spinner-card" : ""} mdl-js-spinner is-active"></div></div></div>`).appendTo(parent);

    componentHandler.upgradeElements($(".mdl-spinner").get());

    setTimeout(function () {
        $("#loader").css({ opacity: 1 });
    }, 1);
}

function hideLoading() {
    $("#loader").css({ opacity: 0 });

    setTimeout(function () {
        $("#loader").remove();
    }, 400);
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
    if (!logout) return;
    logout = false;

    snackbar("Logging out...");

    $.post("/api/auth/logout", function () {
        window.location.reload();
    });
});

$.post("/api/user/identity", function (data) {
    $("#username-load").fadeOut();

    setTimeout(function () {
        $("#username").html(data.Name).fadeIn();
    }, 250);
});