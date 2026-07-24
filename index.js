const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // ضروري جداً لجلب الأعضاء
    ]
});

client.on('ready', () => {
    console.log(`📢 بوت الإعلانات شغال باسم: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    if (message.content.startsWith('!bc')) {
        // التحقق من صلاحيات المشرف
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ ما عندك صلاحية لاستخدام أمر الإعلان!');
        }

        const args = message.content.split(' ').slice(1).join(' ');
        if (!args) {
            return message.reply('❌ يرجى كتابة النص المراد إرساله بعد الأمر.\nمثال: `!bc السلام عليكم`');
        }

        message.reply('⏳ **جاري إرسال الإعلان لجميع أعضاء السيرفر بالخاص... يرجى الانتظار.**');

        let successCount = 0;
        let failCount = 0;

        try {
            // جلب جميع الأعضاء في السيرفر
            await message.guild.members.fetch();

            // إرسال النص الحرفي لكل عضو
            for (const member of message.guild.members.cache.values()) {
                if (member.user.bot) continue;

                try {
                    await member.send(args);
                    successCount++;
                    // تأخير ثانية واحدة لتجنب حظر السبام Rate Limit
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    failCount++;
                }
            }

            message.channel.send(`✅ **تم الانتهاء من الإرسال!**\n- نجح الإرسال إلى: \`${successCount}\` عضو\n- فشل الإرسال إلى: \`${failCount}\` عضو`);

        } catch (error) {
            console.error('خطأ في إرسال الإعلانات:', error);
            message.reply('❌ حدث خطأ أثناء إرسال الإعلان.');
        }
    }
});

client.login(process.env.TOKEN);
