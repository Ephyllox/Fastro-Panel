const greetings = ["Hey, $$!", "Welcome, $$!", "Nice to see you, $$!", "What's going on $$?", "What's up, $$?", "Hi, $$!", "Great to have you here, $$!", "Awesome, you're here $$!", "Woah, you're here, $$!", "Pleasure seeing you, $$!"];

resource.api.user.identity().then((data) => {
    const msg = greetings[Math.floor(Math.random() * greetings.length)];

    $("#welcome").html(msg.replace("$$", `<b>${data.Username}</b>`)).fadeIn();
});