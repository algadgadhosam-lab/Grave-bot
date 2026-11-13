const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = '!bc';

client.once('ready', () => {
    console.log(`[BOT] تم تسجيل الدخول بنجاح باسم ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    if (!message.member.permissions.has('Administrator')) {
        return message.reply('❌ عذراً، يجب أن تمتلك صلاحية **Administrator** لاستخدام أمر البرودكاست.');
    }

    const args = message.content.slice(PREFIX.length).trim();
    if (!args) {
        return message.reply('⚠️ يرجى كتابة الرسالة المراد إرسالها بعد الأمر.\nمثال: `!bc السلام عليكم حياكم الله`');
    }

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📢 إعلان جديد من الإدارة')
        .setDescription(args)
        .setFooter({ text: `تم الإرسال بواسطة: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('bc_info')
                .setLabel('معلومات السيرفر')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📌'),
            new ButtonBuilder()
                .setCustomId('bc_support')
                .setLabel('الدعم الفني')
                .setStyle(ButtonStyle.Link)
                .setUrl('https://discord.gg') // استبدل الرابط برابط سيرفرك أو دعمه
        );

    const statusMessage = await message.reply('⏳ جاري إرسال البرودكاست لجميع الأعضاء...');

    let success = 0;
    let failed = 0;

    try {
        const members = await message.guild.members.fetch();
        
        for (const member of members.values()) {
            if (member.user.bot) continue;
            try {
                await member.send({ embeds: [embed], components: [row] });
                success++;
                await new Promise(resolve => setTimeout(resolve, 500)); // تأخير لتجنب الحظر من ديسكورد
            } catch (err) {
                failed++;
            }
        }

        await statusMessage.edit(`✅ تم الانتهاء من البرودكاست بنجاح!\n- تم الإرسال بنجاح: \`${success}\`\n- فشل الإرسال: \`${failed}\``);
    } catch (error) {
        console.error(error);
        await statusMessage.edit('❌ حدث خطأ أثناء جلب الأعضاء أو إرسال الرسائل.');
    }
});

client.login(process.env.DISCORD_TOKEN);
