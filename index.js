const { Client, GatewayIntentBits, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // ضروري جداً لجلب الأعضاء
    ]
});

client.on('ready', () => {
    console.log(`📢 بوت الإعلانات المزود بخيارات شغال باسم: ${client.user.tag}`);
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
            return message.reply('❌ يرجى كتابة النص المراد إرساله بعد الأمر.\nمثال: `!bc السلام عليكم، تم افتتاخ قسم جديد!`');
        }

        message.reply('⏳ **جاري إرسال الإعلان مع الأزرار لجميع أعضاء السيرفر بالخاص... يرجى الانتظار.**');

        // إنشاء الأزرار (خيارات تفاعلية)
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🌐 زيارة السيرفر')
                    .setStyle(ButtonStyle.Link)
                    .setURL(message.guild.vanityURL || 'https://discord.com'), // رابط السيرفر تلقائياً أو رابط افتراضي
                
                new ButtonBuilder()
                    .setCustomId('support_ticket')
                    .setLabel('🎫 فتح تذاكر الدعم')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('ignore_msg')
                    .setLabel('🔕 تجاهل الإعلانات')
                    .setStyle(ButtonStyle.Secondary)
            );

        let successCount = 0;
        let failCount = 0;

        try {
            // جلب جميع الأعضاء في السيرفر
            await message.guild.members.fetch();

            // إرسال الرسالة لكل عضو مع الأزرار
            for (const member of message.guild.members.cache.values()) {
                if (member.user.bot) continue;

                try {
                    await member.send({
                        content: `📢 **إعلان إداري من سيرفر ${message.guild.name}**\n\n${args}`,
                        components: [row]
                    });
                    successCount++;
                    // تأخير ثانية واحدة لتجنب حظر السبام Rate Limit
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    failCount++;
                }
            }

            message.channel.send(`✅ **تم الانتهاء من إرسال الإعلان مع الخيارات!**\n- نجح الإرسال إلى: \`${successCount}\` عضو\n- فشل الإرسال إلى: \`${failCount}\` عضو (بسبب إغلاق الخاص)`);

        } catch (error) {
            console.error('خطأ في إرسال الإعلانات:', error);
            message.reply('❌ حدث خطأ أثناء جلب الأعضاء أو إرسال الإعلان.');
        }
    }
});

// التعامل مع ضغط الأزرار التي ليس لها روابط مباشرة
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'support_ticket') {
        await interaction.reply({ content: '🎫 تقدر تدخل السيرفر وتتوجه لقسم التذاكر عشان نخدمك!', ephemeral: true });
    } else if (interaction.customId === 'ignore_msg') {
        await interaction.reply({ content: '👍 ولايهمك، تم تسجيل خيارك ولن تتضايق بإشعارات مزعجة.', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
