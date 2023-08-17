const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');

const bot = new Telegraf('5506538841:AAE0sdMpoBzppyGW18VYrGPDtvhYMzX9VvM');
let groups = {};

// --------------------------------------------------------------------------------------------------------------------- //

// JSon Files
if (fs.existsSync('./resources/groups.json')) {
    groups = JSON.parse(fs.readFileSync('./resources/groups.json'));
}
let groupUsers = {};
if (fs.existsSync('./resources/groupUser.json')) {
    groupUsers = JSON.parse(fs.readFileSync('./resources/groupUser.json'));
}

let users = {};
if (fs.existsSync('./resources/users.json')) {
    users = JSON.parse(fs.readFileSync('./resources/users.json'));
}
if (fs.existsSync('./resources/bank.json')) {
    bank = JSON.parse(fs.readFileSync('./resources/bank.json'));
}

function updateGroupUsers(groupId, userId) {
    if (!groupUsers[groupId]) {
        groupUsers[groupId] = [];
    }
    if (!groupUsers[groupId].includes(userId)) {
        groupUsers[groupId].push(userId);
    }
    fs.writeFileSync('./resources/groupUser.json', JSON.stringify(groupUsers, null, 2));
}

function getTopUsers(limit) {
    const users = JSON.parse(fs.readFileSync('./resources/users.json', 'utf8'));
    return Object.values(users).sort((a, b) => b.points - a.points).slice(0, limit);
}

// --------------------------------------------------------------------------------------------------------------------- //

// For Broadcast
const broadcastOptions = {
    group: false,
    user: false,
    copy: false,
    pin: false,
    log: false
};
let repliedMessage = null;
// let joinedPlayers = [];

// --------------------------------------------------------------------------------------------------------------------- //

// Log Group
const logGroupId = '-1001838643650';
let lastMessages = {};

// --------------------------------------------------------------------------------------------------------------------- //

// Admins ids
let admins = [5187014948, 87654321];


// Start function
function botStart(ctx) {
    const userId = ctx.from.id;
    const user = getOrCreateUser(userId, ctx.from.first_name);

    if (!users[userId]) {
        users[userId] = {
            name: ctx.from.first_name,
            score: 10,
            gamesPlayed: 0,
            choices: [],
            friends: []
        };
        fs.writeFileSync('./resources/users.json', JSON.stringify(users, null, 2));
        
    }
    if (ctx.chat.type !== 'private') {
        return ctx.reply('🕹 Grubu kirletmek istemeyiz, o yüzden butona tıklayarak özel sohbetten erişebilirsiniz.', Markup.inlineKeyboard([
            Markup.button.url('Başlat', `t.me/${bot.botInfo.username}?start=start`)
        ]));
    }


    let message = '';
    let buttons = [];

    if (!users[userId]) {
        message = `🎴 Merhaba ${user.name}, telegram ortamında en eğlenceli oyunu oynamak için seçilen kişilerden biri de sen oldun!\n\n🎲 Sihirli kelimeler söylenir, zarlar atılır ve paralar döner..\nn\❓ Nasıl oynandığını öğrenmek için "yardım" butonuna tıklayın.`;
        buttons = [
            [Markup.button.callback('Lider', 'LEADER'), Markup.button.callback('Yardım', 'HELP')],
            [Markup.button.url('Oyun Grubu', 'https://t.me/qiyascc')]
        ];
    } else if (user.gamesPlayed > 0) {
        if (user.score >= 50) {
            message = `🎴 Merhaba ${user.name}, umarım eğleniyorsundur. \n\n🎲 Görünüşe göre zenginsin. 🤠`;
            buttons = [
                [Markup.button.callback('Lider', 'LEADER'), Markup.button.callback('Yardım', 'HELP')],
                [Markup.button.url('Oyun Grubu', 'https://t.me/qiyascc')]
            ];
        } else {
            message = `🎴 Merhaba ${user.name}, umarım eğleniyorsundur. \n\n🎲 Görünüşe göre fakirsin! Sorun yok marketden coin al ve oyuna devam et.`;
            buttons = [
                // [Markup.button.callback('Coin Market', 'COIN_MARKET')],
                [Markup.button.callback('Lider', 'LEADER'), Markup.button.callback('Yardım', 'HELP')],
                [Markup.button.url('Oyun Grubu', 'https://t.me/qiyascc')]
            ];
        }
    } else {
        message = `🎴 Merhaba ${user.name}, seni tekrar görmek sevindirici.\n\n📍 Oynamak için grubumuza katılabilirsin.`;
        buttons = [
            [Markup.button.callback('Lider', 'LEADER'), Markup.button.callback('Yardım', 'HELP')],
            [Markup.button.url('Oyun Grubu', 'https://t.me/qiyascc')]
        ];
    }

    ctx.reply(message, Markup.inlineKeyboard(buttons));
}

// Start command
bot.start((ctx) => {
    botStart(ctx);
});

bot.action('LEADER', (ctx) => {

    const sortedUsers = Object.entries(users).sort((a, b) => b[1].score - a[1].score).slice(0, 20);
    let message = 'En iyi kumarbazlar\n';
    for (let [id, user] of sortedUsers) {
        message += `[${user.score}] ${user.name || id}\n`;
    }
    ctx.editMessageText(message, Markup.inlineKeyboard([
        Markup.button.callback('Geri', 'BACK_TO_START')
    ]));
});

bot.action('HELP', (ctx) => {
    ctx.editMessageText('Merhaba', Markup.inlineKeyboard([
        Markup.button.callback('Geri', 'BACK_TO_START')
    ]));
});


// Banka onemli

// bot.action('COIN_MARKET', (ctx) => {
//     ctx.editMessageText('Mağazamıza hoşgeldin dostum, marketden ne kadar coin almak istersin?', Markup.inlineKeyboard([
//         [Markup.button.callback('50', 'CHOOSE_BUY_50'), Markup.button.callback('100', 'CHOOSE_BUY_100')],
//         [Markup.button.callback('500', 'CHOOSE_BUY_500'), Markup.button.callback('1000', 'CHOOSE_BUY_1000')],
//         [Markup.button.callback('Geri', 'BACK_TO_START')]
//     ]));
// });

// bot.action(/CHOOSE_BUY_(\d+)/, (ctx) => {
//     const amount = ctx.match[1];
//     ctx.editMessageText(`${amount} puan borç almak istediğine emin misin?`, Markup.inlineKeyboard([
//         Markup.button.callback('Onayla', `CONFIRM_BUY_${amount}`),
//         Markup.button.callback('Geri', 'COIN_MARKET')
//     ]));
// });

// bot.action(/CONFIRM_BUY_(\d+)/, async (ctx) => {
//     const amount = parseInt(ctx.match[1]);
//     const userId = ctx.from.id;
//     const user = getOrCreateUser(userId);
//     let bankData = JSON.parse(fs.readFileSync('bank.json', 'utf8'));
//     const bankCurrentMoney = bankData.bank.bank_current_money;

//     if (bankCurrentMoney >= amount) {
//         user.score += amount;

//         bankData.bank.bank_current_money -= amount;

//         if (!bankData.bank.debtor_users[userId]) {
//             bankData.bank.debtor_users[userId] = {
//                 debt: 0,
//                 ratio: 0.20
//             };
//         }
//         bankData.bank.debtor_users[userId].debt += amount;
//         fs.writeFileSync('bank.json', JSON.stringify(bankData));
//         fs.writeFileSync('users.json', JSON.stringify(users));
//         ctx.editMessageText(`Tebrikler! ${amount} puan aldınız.`);
//     } else {
//         ctx.editMessageText(`Üzgünüm, bankada yeterli para yok.`);
//     }
// });


bot.action('BACK_TO_START', (ctx) => {
    ctx.deleteMessage();
    botStart(ctx);
});

// --------------------------------------------------------------------------------------------------------------------- //

// Top List
const getTopList = async (ctx, limit, global = false) => {
    const source = global ? users : groupUsers[ctx.chat.id];
    if (!source) {
        return ctx.reply('Henüz bu grupta oyun oynanmamış.');
    }

    const topUsers = Object.values(source)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    let message = `${global ? 'Globalde' : 'Grupta'} en çok puana sahip olanlar\n`;
    topUsers.forEach((user, index) => {
        const name = user.name || `user_${user.id}`;
        message += `${index + 1}. [${user.score}] ${name}\n`;
    });

    const buttons = topUsers.map((_, index) => [{ text: `${index + 1}`, callback_data: `${global ? 'global' : 'group'}_${index + 1}` }]);
    buttons.push([{ text: 'Kapat', callback_data: 'close_message' }]);

    ctx.reply(message, {
        reply_markup: {
            inline_keyboard: buttons
        }
    });
};

bot.command(['top', 'top20'], (ctx) => getTopList(ctx, 20));
bot.command('top5', (ctx) => getTopList(ctx, 5));

bot.command(['global', 'global20'], (ctx) => getTopList(ctx, 20, true));
bot.command('global5', (ctx) => getTopList(ctx, 5, true));

bot.action(/(group|global)_(\d+)/, (ctx) => {
    const userIndex = parseInt(ctx.match[2]) - 1;
    const user = getTopUsers(ctx.match[1] === 'global' ? 5 : 20)[userIndex];
    const message = `
${user.name || `user_${user.id}`}
Puanı: ${user.score}
Arkadaş sayısı: ${user.friends ? user.friends.length : 0}
Oynadığı oyun sayısı: ${user.gamesPlayed}
    `;
    ctx.editMessageText(message, {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Geri', callback_data: 'go_back' }, { text: 'Kapat', callback_data: 'close_message' }]
            ]
        }
    });
});

bot.action('go_back', (ctx) => {
    const topUsers = getTopUsers(5);
    let message = "Globalde en çok puana sahip olanlar\n";
    const buttons = [];

    topUsers.forEach((user, index) => {
        message += `${index + 1}. [${user.score}] ${user.name || user.id}\n`;
        buttons.push([{ text: `${index + 1}`, callback_data: `global_${index + 1}` }]);
    });
    buttons.push([{ text: 'Kapat', callback_data: 'close_message' }]);

    ctx.editMessageText(message, {
        reply_markup: {
            inline_keyboard: buttons
        }
    });
});

bot.action('close_message', (ctx) => {
    ctx.deleteMessage();
});

// --------------------------------------------------------------------------------------------------------------------- //

// oyun
function diceGame(ctx) {
    const groupId = ctx.chat.id;
    const group = getOrCreateGroup(groupId);

    const userId = ctx.from.id;
    const user = getOrCreateUser(userId, ctx.from.first_name);
    if (user.score <= 0) {
        return ctx.reply(`${ctx.from.first_name}, senin puanın yok, sen oyuna katılamazsın.`);
    }
    if (user.score > 0 && user.score <= 3) {
        ctx.reply('Oyunda sıkıntı çekmemek için şimdiden para al.');
    }
    group.gameStatus = true;
    group.gamers = {};
    ctx.reply('Oyun başlıyor...', Markup.inlineKeyboard([
        Markup.button.callback('Katıl', 'JOIN'),
        Markup.button.callback('Oyunu Başlat', 'START_GAME'),
        Markup.button.callback('ayrul', 'LEAVE')
    ])).then((message) => {
        lastMessages[groupId] = message.message_id;
    });
}
bot.command('dicegame', async (ctx) => {
    diceGame(ctx);
});
bot.action('diceGame', async (ctx) => { 
    diceGame(ctx);
});

// --------------------------------------------------------------------------------------------------------------------- //

bot.action('JOIN', async (ctx) => {
    const groupId = ctx.chat.id;
    const group = getOrCreateGroup(groupId);
    const mention = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    if (!group.gameStatus) {
        return;
    }
    const userId = ctx.from.id;
    const user = getOrCreateUser(userId, ctx.from.first_name);
    if (group.gamers[userId]) {
        return ctx.answerCbQuery('Sen zaten oyundasın');
    }
    group.gamers[userId] = user;
    ctx.answerCbQuery('Katıldın!');
    ctx.reply(`${mention} oyuna katıldı!`);
});

bot.action('LEAVE', (ctx) => {
    const groupId = ctx.chat.id;
    const group = getOrCreateGroup(groupId);
    const mention = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    if (!group.gameStatus) {
        return;
    }
    const userId = ctx.from.id;
    const user = getOrCreateUser(userId);
    if (!group.gamers[userId]) {
        return ctx.answerCbQuery('Sen zaten oyunda değilsin');
    }
    delete group.gamers[userId];
    ctx.reply(`${mention} korktu ve çekildi!`);
});

bot.action('START_GAME', async (ctx) => {
    const groupId = ctx.chat.id;
    const group = getOrCreateGroup(groupId);
    if (!group.gameStatus || group.gameButtonPressed) {
        return;
    }
    group.gameButtonPressed = true;
    group.gameStarted = true;
    for (let userId in group.gamers) {
        group.gamers[userId].choices = [];
    }
    if (lastMessages[groupId]) {
        await ctx.telegram.deleteMessage(ctx.chat.id, lastMessages[groupId]);
    }
    ctx.reply('🎲 Zarlar birazdan atılacak!\n\n🆓 Hadi seçimini yap ve bize ne kadar profesyonel bir kumarbaz olduğunu göster.', Markup.inlineKeyboard([
        [
            Markup.button.callback('1 (x6)', '1'),
            Markup.button.callback('2 (x6)', '2'),
            Markup.button.callback('3 (x6)', '3')
        ],
        [
            Markup.button.callback('4 (x6)', '4'),
            Markup.button.callback('5 (x6)', '5'),
            Markup.button.callback('6 (x6)', '6')
        ],
        [
            Markup.button.callback('1,2 (x3)', '1,2'),
            Markup.button.callback('3,4 (x3)', '3,4'),
            Markup.button.callback('5,6 (x3)', '5,6')
        ],
        [
            Markup.button.callback('1,2,3 (x2)', '1,2,3'),
            Markup.button.callback('4,5,6 (x2)', '4,5,6')
        ],
        [
            Markup.button.callback('1,3,5 (x2)', '1,3,5'),
            Markup.button.callback('2,4,6 (x2)', '2,4,6')
        ],
        [
            Markup.button.callback('Puanını Gör', 'CHECK_SCORE')
        ]
    ])).then((message) => {
        lastMessages[groupId] = message.message_id;
    });
    setTimeout(async () => {
        if (lastMessages[groupId]) {
            await ctx.telegram.deleteMessage(ctx.chat.id, lastMessages[groupId]);
        }
        const diceResult = await ctx.replyWithDice();
        group.randomNumber = diceResult.dice.value;
        setTimeout(() => {
            endGame(ctx, groupId);
        }, 6000);
    }, 15000);
});

async function endGame(ctx, groupId) {
    const group = getOrCreateGroup(groupId);
    if (!group.gameStarted) {
        return;
    }
    group.gameStarted = false;
    group.gameButtonPressed = false;
    let message = 'Oyun bitti\n\n';
    for (let userId in group.gamers) {
        let user = getOrCreateUser(userId);
        if (user.gamesPlayed > 0) {
            updateGroupUsers(groupId, userId);
        }
        let totalScoreChange = 0;
        for (let choice of user.choices) {
            let choiceArray = typeof choice === 'string' ? choice.split(',') : [choice];
            let scoreChange = 0;
            if (choiceArray.length === 1) {
                scoreChange = 6;
            } else if (choiceArray.length === 2) {
                scoreChange = 3;
            } else {
                scoreChange = 2;
            }
            if (choiceArray.includes(String(group.randomNumber))) {
                totalScoreChange += scoreChange;
            }
        }
        user.score += totalScoreChange;
        user.gamesPlayed += 1;
        message += `- [${user.score}] ${user.name}: ${user.choices.length} --> ${totalScoreChange}\n`;
    }
    fs.writeFileSync('./resources/users.json', JSON.stringify(users, null, 2));
    ctx.reply(message, Markup.inlineKeyboard([
        Markup.button.callback('Devam Et', 'CONTINUE_GAME'),
        Markup.button.callback('Yeter', 'STOP_GAME')
    ])).then((message) => {
        lastMessages[groupId] = message.message_id;
    });
}

bot.action('CHECK_SCORE', (ctx) => {
    const userId = ctx.from.id;
    const user = getOrCreateUser(userId);
    if (!user) {
        return;
    }
    ctx.answerCbQuery('Puanın: ' + user.score);
});

bot.action(['1', '2', '3', '4', '5', '6', '1,2', '3,4', '5,6', '1,2,3', '4,5,6', '2,4,6', '1,3,5'], (ctx) => {
    const groupId = ctx.chat.id;
    const group = getOrCreateGroup(groupId);
    const userId = ctx.from.id;
    const user = getOrCreateUser(userId);
    if (!group.gameStatus || !group.gameButtonPressed || !group.gamers[userId] || (user.choices && user.choices.length >= 3)) {
        return ctx.answerCbQuery('Sen oyunda değilsin veya zaten 3 seçim yaptın');
    }
    if (user.score <= 0) {
        delete group.gamers[userId];
        return ctx.answerCbQuery('Puanın sıfır, daha fazla seçim yapamazsın ve oyundan elendin');
    }
    user.choices.push(ctx.match[0]);
    user.score -= 1;
    ctx.answerCbQuery('Seçimin: ' + ctx.match[0]);
});

bot.action('CONTINUE_GAME', async (ctx) => {
    const groupId = ctx.chat.id;
    const group = getOrCreateGroup(groupId);
    group.gameStatus = true;
    group.gameButtonPressed = false;
    if (lastMessages[groupId]) {
        await ctx.telegram.editMessageReplyMarkup(ctx.chat.id, lastMessages[groupId], undefined, undefined);
    }
    ctx.reply('Oyun devam ediyor...', Markup.inlineKeyboard([
        Markup.button.callback('Katıl', 'JOIN'),
        Markup.button.callback('Oyunu Başlat', 'START_GAME')
    ])).then((message) => {
        lastMessages[groupId] = message.message_id;
    });
});

bot.action('STOP_GAME', async (ctx) => {
    const groupId = ctx.chat.id;
    const group = getOrCreateGroup(groupId);
    group.gameStatus = false;
    group.gameButtonPressed = false;

    if (lastMessages[groupId]) {
        await ctx.telegram.editMessageReplyMarkup(ctx.chat.id, lastMessages[groupId], undefined, undefined);
    }

    ctx.reply('Oyun durduruldu.').then((message) => {
        lastMessages[groupId] = message.message_id;
    });
});

// --------------------------------------------------------------------------------------------------------------------- //

// Olustur yada al
function getOrCreateGroup(groupId) {
    if (!groups[groupId]) {
        groups[groupId] = {
            gameStatus: false,
            gameButtonPressed: false,
            randomNumber: 0,
            gamers: {}
        };
    }

    return groups[groupId];
}


function getOrCreateUser(userId, name) {
    if (!users[userId]) {
        users[userId] = {
            name: name,
            score: 10,
            gamesPlayed: 0,
            choices: [],
            friends: []
        };
        fs.writeFileSync('./resources/users.json', JSON.stringify(users, null, 2));
    }

    return users[userId];
}
// --------------------------------------------------------------------------------------------------------------------- //

// Cark
bot.command('wheel', async (ctx) => {
    if (ctx.chat.type !== 'private') {
        return ctx.reply('Çark çevirme işlemi grupta yapılamaz');
    }

    const userId = ctx.from.id;
    const user = getOrCreateUser(userId);
    if (user.lastWheelSpin && Date.now() - user.lastWheelSpin < 24 * 60 * 60 * 1000) {
        const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - user.lastWheelSpin)) / (60 * 60 * 1000));
        return ctx.reply(`Sizin henüz ${hoursLeft} saat kadar beklemeniz lazım, bu komut 24 saatde bir kullanılabilir.`);
    }
    await ctx.replyWithAnimation('CgACAgQAAx0CcViTAAPdoGTNXfu6oi7_anMfbfz9hSxF3JesAAImAwACEbYNU82fOfny8-bdHgQ', { caption: 'Çark dönüyor...' });
    await new Promise(resolve => setTimeout(resolve, 5000));

    const points = Math.floor(Math.random() * 15) + 1;
    user.score += points;
    user.lastWheelSpin = Date.now();
    fs.writeFileSync('./resources/users.json', JSON.stringify(users, null, 2));
    ctx.reply(`Siz bugün çarktan ${points} puan kazandınız`);
});



// --------------------------------------------------------------------------------------------------------------------- //

// Arkadaş ekleme
bot.command('addfriend', (ctx) => {
    if (!ctx.message.reply_to_message) {
        return ctx.reply('Lütfen bir kullanıcı mesajını yanıtlayın.');
    }

    const userId = ctx.from.id;
    const friendId = ctx.message.reply_to_message.from.id;

    const user = getOrCreateUser(userId);
    const friend = getOrCreateUser(friendId);

    if (!user || !friend) {
        return ctx.reply('Henüz içinizden birisi benimle oynamadı, sizi arkadaş yapamam');
    }

    if (user.gamesPlayed === 0 || friend.gamesPlayed === 0) {
        return ctx.reply('Henüz içinizden birisi benimle oynamadı, sizi arkadaş yapamam');
    }

    user.friends.push(friendId);

    fs.writeFileSync('./resources/users.json', JSON.stringify(users, null, 2));

    ctx.reply(`${ctx.message.reply_to_message.from.first_name} arkadaş listenize eklendi`);
});

bot.command('friend', (ctx) => {
    const userId = ctx.from.id;

    if (ctx.chat.type !== 'private') {
        return ctx.reply('Bu komut grupta kullanılamaz');
    }

    const user = getOrCreateUser(userId);

    if (!user || user.friends.length === 0) {
        return ctx.reply('Sizin arkadaşınız yok, siz tanrının yalnız adamısınız');
    }

    let buttons = [];
    for (let friendId of user.friends) {
        const friend = getOrCreateUser(friendId);
        buttons.push([Markup.button.callback(friend.name, `FRIEND_${friendId}`)]);
    }

    ctx.reply('Sizin arkadaşlarınız:', Markup.inlineKeyboard(buttons));
});

bot.action(/FRIEND_(.+)/, (ctx) => {
    const userId = ctx.from.id;
    const friendId = ctx.match[1];

    const friend = getOrCreateUser(friendId);

    ctx.editMessageText(`Adı: ${friend.name}\nPuanı: ${friend.score}\nOynadığı Oyun Sayısı: ${friend.gamesPlayed}`, Markup.inlineKeyboard([
        Markup.button.callback('Geri', 'BACK'),
        Markup.button.callback('Borç', `DEBT_${friendId}`)
    ]));
});

bot.action('BACK', (ctx) => {
    const userId = ctx.from.id;

    const user = getOrCreateUser(userId);

    let buttons = [];
    for (let friendId of user.friends) {
        const friend = getOrCreateUser(friendId);
        buttons.push([Markup.button.callback(friend.name, `FRIEND_${friendId}`)]);
    }

    ctx.editMessageText('Sizin arkadaşlarınız:', Markup.inlineKeyboard(buttons));
});

// Arkadas borc

bot.action(/DEBT_AMOUNT_(.+)_([0-9.]+)/, async (ctx) => {
    const userId = ctx.from.id;
    const friendId = ctx.match[1];
    const percentage = parseFloat(ctx.match[2]);

    const user = getOrCreateUser(userId);
    const friend = getOrCreateUser(friendId);
    const maxDebt = Math.floor(friend.score / 2);
    const debtAmount = Math.floor(maxDebt * percentage);

    user.debtRequests = user.debtRequests || {};
    user.debtRequests[friendId] = user.debtRequests[friendId] || 0;

    if (user.debtRequests[friendId] >= 2) {
        return ctx.reply('Bugün 2 kez istedin daha fazla isteyemezsin aynı kişiden, başka kişiden istemeyi dene');
    }
    user.debtRequests[friendId]++;
    friend.debtStatus = {
        amount: debtAmount,
        status: 'pending'
    };

    fs.writeFileSync('./resources/users.json', JSON.stringify(users, null, 2));

    await bot.telegram.sendMessage(friendId, `${ctx.from.first_name} sizden ${debtAmount} miktarında puan borç istiyor. Vermek istiyor musunuz?`, Markup.inlineKeyboard([
        Markup.button.callback('Onayla', `APPROVE_DEBT_${userId}`),
        Markup.button.callback('Reddet', `REJECT_DEBT_${userId}`)
    ]));

    ctx.reply('İstek gönderildi');
});

bot.action(/APPROVE_DEBT_(.+)/, (ctx) => {
    const userId = ctx.from.id;
    const debtorId = ctx.match[1];

    const user = getOrCreateUser(userId);
    const debtor = getOrCreateUser(debtorId);

    if (!user.debtStatus || user.debtStatus.status !== 'pending') {
        return ctx.reply('Borç isteği yok');
    }

    const debtAmount = user.debtStatus.amount;
    user.score -= debtAmount;
    debtor.score += debtAmount;
    user.debtStatus.status = 'approved';

    fs.writeFileSync('./resources/users.json', JSON.stringify(users, null, 2));

    ctx.reply('Borç onaylandı');
    bot.telegram.sendMessage(debtorId, `Arkadaşınız ${ctx.from.first_name} size, ${debtAmount} miktarında borç verdi.`);
});

bot.action(/REJECT_DEBT_(.+)/, (ctx) => {
    const userId = ctx.from.id;
    const debtorId = ctx.match[1];

    const user = getOrCreateUser(userId);
    const debtor = getOrCreateUser(debtorId);

    if (!user.debtStatus || user.debtStatus.status !== 'pending') {
        return ctx.reply('Borç isteği yok');
    }

    user.debtStatus.status = 'rejected';

    fs.writeFileSync('./resources/users.json', JSON.stringify(users, null, 2));

    ctx.reply('Borç reddedildi');
    bot.telegram.sendMessage(debtorId, `Arkadaşınız ${ctx.from.first_name} size o kadar güvenmiyormuş. :(`);

});

bot.action(/DEBT_(.+)/, (ctx) => {
    const friendId = ctx.match[1];

    ctx.editMessageText('Borç miktarını seçin:', Markup.inlineKeyboard([
        Markup.button.callback('25%', `DEBT_AMOUNT_${friendId}_0.25`),
        Markup.button.callback('50%', `DEBT_AMOUNT_${friendId}_0.5`),
        Markup.button.callback('75%', `DEBT_AMOUNT_${friendId}_0.75`),
        Markup.button.callback('100%', `DEBT_AMOUNT_${friendId}_1`)
    ]));
});

// --------------------------------------------------------------------------------------------------------------------- //
// Broadcast

bot.command('broadcast', async (ctx) => {
    if (!admins.includes(ctx.from.id)) {
        return ctx.reply('Bu komutu kullanma yetkiniz yok.');
    }

    if (!ctx.message || !ctx.message.reply_to_message) {
        return ctx.reply('Lütfen bir mesajı yanıtlayarak bu komutu kullanın.');
    }
    repliedMessage = ctx.message.reply_to_message;

    const message = 'Özellikleri seçin';
    const buttons = [
        [{ text: 'Grup', callback_data: 'toggle_group' }, { text: 'Kullanıcı', callback_data: 'toggle_user' }],
        [{ text: 'Kopya', callback_data: 'toggle_copy' }, { text: 'Sabit', callback_data: 'toggle_pin' }, { text: 'Log', callback_data: 'toggle_log' }],
        [{ text: '✓ Onayla', callback_data: 'confirm_broadcast' }, { text: 'İptal', callback_data: 'cancel_broadcast' }]
    ];

    ctx.reply(message, { reply_markup: { inline_keyboard: buttons } });
});

function isAdmin(ctx) {
    return admins.includes(ctx.from.id);
}
bot.action(/toggle_(.+)/, (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.answerCbQuery('Sen admin değilsin!');
    }
    const option = ctx.match[1];
    broadcastOptions[option] = !broadcastOptions[option];

    const buttons = [
        [{ text: `Grup ${broadcastOptions.group ? '✅' : ''}`, callback_data: 'toggle_group' }, { text: `Kullanıcı ${broadcastOptions.user ? '✅' : ''}`, callback_data: 'toggle_user' }],
        [{ text: `Kopya ${broadcastOptions.copy ? '✅' : ''}`, callback_data: 'toggle_copy' }, { text: `Sabit ${broadcastOptions.pin ? '✅' : ''}`, callback_data: 'toggle_pin' }, { text: `Log ${broadcastOptions.log ? '✅' : ''}`, callback_data: 'toggle_log' }],
        [{ text: '✓ Onayla', callback_data: 'confirm_broadcast' }, { text: 'İptal', callback_data: 'cancel_broadcast' }]
    ];

    ctx.editMessageReplyMarkup({ inline_keyboard: buttons });
});

bot.action('cancel_broadcast', (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.answerCbQuery('Sen admin değilsin!');
    }
    ctx.deleteMessage();
});

bot.action('confirm_broadcast', async (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.answerCbQuery('Sen admin değilsin!');
    }
    ctx.deleteMessage();

    const groupUsers = JSON.parse(fs.readFileSync('./resources/groupUser.json', 'utf8'));
    const message = repliedMessage;

    let groupCount = 0;
    let userCount = 0;

    if (broadcastOptions.group) {
        for (const groupId in groupUsers) {
            try {
                if (broadcastOptions.copy) {
                    await ctx.telegram.sendCopy(groupId, message);
                } else {
                    await ctx.telegram.forwardMessage(groupId, message.chat.id, message.message_id);
                }

                if (broadcastOptions.pin) {
                    const chatPermissions = await ctx.telegram.getChat(groupId);
                    if (chatPermissions.can_pin_messages) {
                        await ctx.telegram.pinChatMessage(groupId, message.message_id);
                    }
                }

                groupCount++;
            } catch (error) {
                console.error(`Grup mesajı gönderilirken hata: ${error}`);
            }
        }
    }
    if (broadcastOptions.log) {
        const logMessage = `
Mesaj Gönderme İşlemi Başarılı.
Grup sayısı: ${groupCount}
Kullanıcı sayısı: ${userCount}
Sabit durumu: ${broadcastOptions.pin ? 'Aktif' : 'Deaktif'}
Loglama: ${broadcastOptions.log ? 'Aktif' : 'Deaktif'}
Kopya: ${broadcastOptions.copy ? 'Aktif' : 'Deaktif'}
    `;

        try {
            await ctx.telegram.sendMessage(logGroupId, logMessage);
        } catch (error) {
            console.error(`Log grubuna mesaj gönderilirken hata: ${error}`);
        }
    }
});

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
