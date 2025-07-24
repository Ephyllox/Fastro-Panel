const userLoad = progress("#user-list-card", true);
const sessionLoad = progress("#session-list-card", true);
const settingsLoad = progress("#setting-list-card", true);

const settingTypes = {
    string: "text",
    number: "number",
    boolean: "checkbox",
    array: "text",
};

async function deleteUser(id, name) {
    snackbar(`Deleting user: ${name}, please wait...`);
    userLoad.show();

    try {
        await resource.api.user.update("DELETE", { "user_id": id, "delete_user": true });
        $(`[data-user-id="${id}"]`).remove();
        snackbar(`Successfully deleted user ${name}!`);
    }
    catch (e) {
        snackbar(e.responseText, 1500);
    }
    finally {
        userLoad.hide();
    }
}

async function toggleBlockUser(id, name, status) {
    snackbar(`${status ? "Blocking" : "Unblocking"} user: ${name}, please wait...`);
    userLoad.show();

    try {
        await resource.api.user.update("PATCH", { "user_id": id, "blocked": status });
        snackbar(`Successfully ${status ? "blocked" : "unblocked"} user ${name}!`);
        return true;
    }
    catch (e) {
        snackbar(e.responseText, 1500);
    }
    finally {
        userLoad.hide();
    }
}

async function loadUsers(identity) {
    try {
        const users = await resource.api.user.list();
        let delay = 50;

        userLoad.hide();

        users.forEach(function (user) {
            const clone = $("#ul-user").clone(), localuser = user.UserId === identity.UserId;
            clone.attr("data-user-id", user.UserId);
            clone.attr("title", user.LastLoginDate ? new Date(user.LastLoginDate).toLocaleString() : "Last login unknown");
            clone.find("#ul-user-name").html(!localuser ? user.Username : `${user.Username} (you)`);

            const update = () => clone.find("#ul-user-btn-block-icon").html(`${user.Disabled ? "how_to_reg" : "block"}`);

            if (localuser || user.UserId === 1) {
                clone.find("#ul-user-btn-manage").attr("disabled", true);
                clone.find("#ul-user-btn-delete").attr("disabled", true);
                clone.find("#ul-user-btn-block").attr("disabled", true);
            }

            clone.find("#ul-user-btn-manage").click(() => {
                window.location.href = `manage-account?id=${user.UserId}`;
            });

            clone.find("#ul-user-btn-delete").click(async () => {
                if (userLoad.busy || !await showConfirmation(`Are you sure you want to delete ${user.Username}?`)) return;
                await deleteUser(user.UserId, user.Username);
            });

            clone.find("#ul-user-btn-block").click(async () => {
                if (userLoad.busy || !await showConfirmation(`Are you sure you want to ${!user.Disabled ? "block" : "unblock"} ${user.Username}?`)) return;

                if (await toggleBlockUser(user.UserId, user.Username, !user.Disabled)) {
                    user.Disabled = !user.Disabled;
                    update();
                }
            });

            update();
            clone.hide();
            clone.appendTo("#user-list");

            setTimeout(() => {
                clone.fadeIn();
            }, delay);

            delay += 25;
        });
    }
    catch (e) {
        if (e.status === 403) $("#user-list-card").parent().hide();
    }
}

async function revokeSession(id) {
    snackbar(`Revoking session: ${id}, please wait...`);
    sessionLoad.show();

    try {
        await resource.api.session.revoke("POST", { "session_id": id });
        $(`[data-session-id="${id}"]`).remove();
        return true;
    }
    catch (e) {
        snackbar(e.responseText, 1500);
    }
    finally {
        sessionLoad.hide();
    }
}

async function loadSessions(identity) {
    try {
        const sessions = await resource.api.session.list();
        let delay = 50;

        sessionLoad.hide();

        sessions.forEach(function (session) {
            const clone = $("#ul-session").clone(), localsession = session.SessionId === identity.SessionId;
            const revokeBtn = clone.find("#ul-session-btn-revoke");
            clone.attr("data-session-id", session.SessionId);
            clone.attr("title", session.RemoteAddress ?? "Unknown IP address");
            clone.find("#ul-session-name").html(!localsession ? session.Username : `${session.Username} (current)`);
            clone.find("#ul-session-creation").html(new Date(session.CreationDate).toLocaleString());

            if (session.UserId === 1 && session.UserId !== identity.UserId) {
                revokeBtn.attr("disabled", true);
            }

            revokeBtn.click(async () => {
                if (sessionLoad.busy) return;

                if (await revokeSession(session.SessionId)) {
                    if (localsession) window.location.replace(resource.login);
                }
            });

            clone.hide();
            clone.appendTo("#session-list");

            setTimeout(() => {
                clone.fadeIn();
            }, delay);

            delay += 25;
        });
    }
    catch (e) {
        if (e.status === 403) $("#session-list-card").parent().hide();
    }
}

async function showInputDialog(text, value, valueType) {
    const isBoolean = valueType === "boolean";
    const isArray = valueType === "array";

    return new Promise((resolve) => {
        Swal.fire({
            title: "Edit Setting",
            text: !isBoolean && text,
            input: settingTypes[valueType],
            inputValue: !isBoolean ? (!isArray ? value : value.toString()) : !!value,
            inputPlaceholder: !isBoolean ? "Enter a value..." : text,
            inputAttributes: {
                autocapitalize: "off",
                spellcheck: "false",
            },
            showCancelButton: true,
            reverseButtons: true,
            confirmButtonText: "Set",
            footer: '<div class="text-center">Please make sure to apply your changes.</div>',
            inputValidator: (result) => {
                if (isBoolean) return;
                if (isArray) return !result.split(",").length;
                if (!result) return "You need to enter a value.";
            },
        }).then((result) => {
            if (result.isConfirmed) {
                switch (valueType) {
                    case "string":
                        return resolve(result.value);
                    case "number":
                        return resolve(Number(result.value));
                    case "boolean":
                        return resolve(result.value ? true : false);
                    case "array":
                        const array = result.value ? result.value.split(",") : [];
                        return resolve(array.map((item) => item.toString()));
                }
            }
            else {
                resolve();
            }
        });
    });
}

function formatSettingValue(value, valueType) {
    switch (valueType) {
        case "string":
            return `"${value}"`;
        case "number":
            return value;
        case "boolean":
            return value ? "enabled" : "disabled";
        case "array":
            return value.toString().replace(/,/g, ", ");
    }
}

async function updateSettings(settings) {
    snackbar(`Applying settings, please wait...`);
    settingsLoad.show();

    try {
        await resource.api.system.updateSettings("PATCH", { settings: settings });
        snackbar(`Successfully updated settings!`);
        return true;
    }
    catch (e) {
        $("#setting-list-apply").attr("disabled", false);
        snackbar(e.responseText, 5000);
    }
    finally {
        settingsLoad.hide();
    }
}

async function loadSettings() {
    const applyBtn = $("#setting-list-apply");

    try {
        const settings = await resource.api.system.getSettings();
        let delay = 50;

        settingsLoad.hide();

        settings.forEach(function (setting) {
            const clone = $("#ul-setting").clone();
            const resetBtn = clone.find("#ul-setting-btn-reset");
            const settingKey = clone.find("#ul-setting-key");
            const settingValue = clone.find("#ul-setting-value");
            let displayValue = formatSettingValue(setting.Value, setting.Type);
            clone.attr("data-setting-key", setting.Key);
            settingKey.html(setting.Key).attr("title", setting.Key);
            settingValue.html(displayValue).attr("title", displayValue);
            setting.originalValue = setting.Value;

            const compareValues = (value1, value2 = setting.DefaultValue) => {
                return JSON.stringify(value1) === JSON.stringify(value2);
            };

            const setValue = (value) => {
                displayValue = formatSettingValue(value, setting.Type);
                settingValue.html(displayValue).attr("title", displayValue);
                if (!compareValues(value)) resetBtn.show(); else resetBtn.hide();
                settingKey.css("color", !compareValues(value, setting.originalValue) ? "cadetblue" : "");
                applyBtn.attr("disabled", false);
                setting.Value = value;
            };

            if (!compareValues(setting.Value)) resetBtn.show();

            resetBtn.click(async () => {
                if (settingsLoad.busy) return;
                setValue(setting.DefaultValue);
            });

            clone.find("#ul-setting-btn-edit").click(async () => {
                if (settingsLoad.busy) return;

                const value = await showInputDialog(setting.Key, setting.Value, setting.Type);
                if (value !== undefined) setValue(value);
            });

            clone.hide();
            clone.appendTo("#setting-list");

            setTimeout(() => {
                clone.fadeIn();
            }, delay);

            delay += 25;
        });

        applyBtn.click(async () => {
            if (settingsLoad.busy) return;

            const dict = {};
            settings.forEach((item) => dict[item.Key] = item.Value);

            applyBtn.attr("disabled", true);

            if (await updateSettings(dict)) {
                settings.forEach((item) => {
                    item.originalValue = item.Value;
                    $(`[data-setting-key="${item.Key}"]`).find("#ul-setting-key").css("color", "");
                });
            }
        });
    }
    catch (e) {
        if (e.status === 403) $("#setting-list-card").parent().hide();
    }
}

$("#create-account").click(function () {
    window.location.href = "create-account";
});

resource.api.user.identity().then((data) => {
    loadUsers(data);
    loadSessions(data);
    loadSettings();
});