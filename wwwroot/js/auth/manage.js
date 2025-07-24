$("#register").submit(async (e) => {
    const username = $("#new-username").val();
    const password = $("#new-password").val();
    const password_confirm = $("#new-password-confirm").val();
    const roles = $("#user-permissions").val();

    e.preventDefault();

    if (username && password && password_confirm && !$("#sendregister").attr("disabled")) {
        $("#sendregister").attr("disabled", true);
        $("#sendregister").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        try {
            await resource.api.user.create("POST", {
                "username": username,
                "password": password,
                "password_confirm": password_confirm,
                "roles": roles,
            });

            $("#new-username").attr("disabled", true);
            $("#new-password").attr("disabled", true);
            $("#new-password-confirm").attr("disabled", true);
            $("#user-permissions").attr("disabled", true);
            $("#registration-success").fadeIn();
        }
        catch (e) {
            $("#sendregister").removeAttr("disabled");
            $("#error").html(`Error - ${e.responseText}`);
            $("#error").hide().fadeIn();
        }

        $("#sendregister").removeClass("progress-bar-striped progress-bar-animated");
    }
});

$("#update").submit(async (e) => {
    const locations = $("#user-locations").val();
    const roles = $("#user-permissions").val();

    e.preventDefault();

    if (!$("#sendupdate").attr("disabled")) {
        $("#sendupdate").attr("disabled", true);
        $("#sendupdate").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        try {
            await resource.api.user.update("PATCH", {
                "user_id": query.get("id"),
                "locations": locations,
                "roles": roles,
            });

            $("#update-success").fadeIn();
        }
        catch (e) {
            $("#sendupdate").removeAttr("disabled");
            $("#error").html(`Error - ${e.responseText}`);
            $("#error").hide().fadeIn();
        }

        $("#sendupdate").removeClass("progress-bar-striped progress-bar-animated");
    }
});

$("#update").change(() => {
    $("#update-success").hide();
    $("#sendupdate").removeAttr("disabled");
});

$("#clear-locations").click(async () => {
    if (!$("#clear-locations").attr("disabled")) {
        $("#clear-locations").attr("disabled", true);
        $("#clear-locations").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        try {
            await resource.api.user.update("DELETE", {
                "user_id": query.get("id"),
                "delete_locations": true,
            });

            $("#user-locations").find("option:enabled").remove();
        }
        catch (e) {
            $("#clear-locations").removeAttr("disabled");
            $("#error").html(`Error - ${e.responseText}`);
            $("#error").hide().fadeIn();
        }

        $("#clear-locations").removeClass("progress-bar-striped progress-bar-animated");
    }
});

$("#remove-msa").click(async () => {
    if (!$("#remove-msa").attr("disabled")) {
        $("#remove-msa").attr("disabled", true);
        $("#remove-msa").addClass("progress-bar-striped progress-bar-animated");
        $("#error").hide();

        try {
            await resource.api.user.update("DELETE", {
                "user_id": query.get("id"),
                "remove_msa": true,
            });

            $("#remove-msa").hide();
        }
        catch (e) {
            $("#remove-msa").removeAttr("disabled");
            $("#remove-msa").removeClass("progress-bar-striped progress-bar-animated");
            $("#error").html(`Error - ${e.responseText}`);
            $("#error").hide().fadeIn();
        }
    }
});

if ($("#user-locations option").length > 1) $("#clear-locations").removeAttr("disabled");