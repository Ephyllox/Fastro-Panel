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

    setTimeout(() => {
        toast.MaterialSnackbar.skipClearing++;
        toast.MaterialSnackbar.showSnackbar({ message: message, timeout: timeout });
    }, toast.MaterialSnackbar.Constant_.ANIMATION_LENGTH);
}

function sessionAlert() {
    Swal.fire({
        icon: "warning",
        title: "You've been signed out!",
        html: "Please log in again after closing this message.<br />Any previous actions were canceled.",
        didClose: () => window.location.reload(),
    });
}

async function showConfirmation(title) {
    return new Promise((resolve) => {
        Swal.fire({
            title: title,
            icon: "question",
            showCancelButton: true,
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) resolve(true); else resolve(false);
        });
    });
}

$("#change-pwd").click(() => {
    Swal.fire({
        title: "Change your password",
        html: "<div>You will be signed out of every session after changing your password.</div>" +
            `<input id="swal-input1" class="swal2-input" placeholder="Current password" type="password">` +
            `<input id="swal-input2" class="swal2-input" placeholder="New password" type="password">` +
            `<input id="swal-input3" class="swal2-input" placeholder="Confirm new password" type="password">`,
        showLoaderOnConfirm: true,
        showCancelButton: true,
        reverseButtons: true,
        focusConfirm: false,
        confirmButtonText: "Change",
        cancelButtonText: "Cancel",
        preConfirm: () => {
            return resource.api.auth.changePassword("PATCH", {
                "current_password": $("#swal-input1").val(),
                "new_password": $("#swal-input2").val(),
                "new_password_confirm": $("#swal-input3").val(),
            }).then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Successfully changed password",
                    didClose: () => window.location.reload(),
                });
            }).catch((e) => {
                Swal.showValidationMessage(e.responseText);
            });
        },
    });
});

$("#logout").click(async () => {
    if (logout) return;
    logout = true;

    snackbar("Logging out...");

    await resource.api.auth.logout();
    window.location.replace(resource.login);
});

function updateMsaToggle(enabled) {
    $("#toggle-msa").text(enabled ? "Disable 2FA" : "Enable 2FA");
}

resource.api.user.identity().then((data) => {
    $("#username-load").fadeOut();

    setTimeout(() => {
        $("#username").html(data.Username).fadeIn();
    }, 250);

    updateMsaToggle(data.MsaEnabled);

    $("#toggle-msa").click(async () => {
        if (data.MsaEnabled) {
            return Swal.fire({
                title: "Disable two-factor login",
                input: "password",
                inputLabel: "Enter your password to disable 2FA:",
                inputPlaceholder: "Current password",
                confirmButtonText: "Disable 2FA",
                showLoaderOnConfirm: true,
                showCancelButton: true,
                reverseButtons: true,
                preConfirm: (password) => {
                    return resource.api.auth.removeMsa("DELETE", {
                        "current_password": password,
                    }).then(() => {
                        data.MsaEnabled = false;
                        updateMsaToggle(false);

                        Swal.fire({
                            icon: "success",
                            title: "Successfully disabled 2FA.",
                        });
                    }).catch((e) => {
                        Swal.showValidationMessage(e.responseText);
                    });
                },
            });
        }

        try {
            Swal.showLoading();

            const msaData = await resource.api.auth.setupMsa("POST", { code: null });

            Swal.fire({
                title: "Enable two-factor login",
                html: `<b>Scan the image with your authenticator app or enter the code below:</b><br />${msaData.Secret}`,
                input: "text",
                inputLabel: "Confirm the verification code to enable 2FA:",
                inputPlaceholder: "Verification code",
                confirmButtonText: "Enable 2FA",
                showLoaderOnConfirm: true,
                showCancelButton: true,
                reverseButtons: true,
                imageUrl: msaData.QRCode,
                imageAlt: "Authenticator QR Code",
                inputAttributes: {
                    maxlength: 6,
                    autocomplete: "off",
                },
                inputValidator: (value) => {
                    if (!value) return "Please enter the verification code.";
                },
                preConfirm: (code) => {
                    return resource.api.auth.setupMsa("POST", {
                        "code": code,
                    }).then(() => {
                        data.MsaEnabled = true;
                        updateMsaToggle(true);

                        Swal.fire({
                            icon: "success",
                            title: "Successfully enabled 2FA.",
                        });
                    }).catch((e) => {
                        Swal.showValidationMessage(e.responseText);
                    });
                },
            });
        }
        catch {
            Swal.close();
            snackbar("Failed to load verification setup.");
        }
    });
});