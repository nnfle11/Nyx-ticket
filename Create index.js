const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`✅ البوت NYX Ticket شغال بنجاح باسم: ${client.user.tag}`);
});

// أمر تجهيز بنل التذاكر في السيرفر (اكتب !setup-ticket)
client.on('messageCreate', async (message) => {
    if (message.content === '!setup-ticket' && message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('فتح تذكرة 🎫')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({
            content: '📌 **دعم NYX Ticket**\nاضغط على الزر أسفله لفتح تذكرة جديدة والتواصل مع الإدارة.',
            components: [row]
        });
    }
});

// التفاعل مع الأزرار (فتح وإغلاق التذكرة)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'create_ticket') {
        const channelName = `ticket-${interaction.user.username}`;
        
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName.toLowerCase());
        if (existingChannel) {
            return interaction.reply({ content: `عندك تذكرة مفتوحة بالفعل: ${existingChannel}`, ephemeral: true });
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
            ],
        });

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة 🔒')
                .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({
            content: `مرحباً بك ${interaction.user} في دعم NYX Ticket، تفضل بكتابة مشكلتك وسيرد عليك الفريق.`,
            components: [closeRow]
        });

        await interaction.reply({ content: `تم فتح تذكرتك بنجاح: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply('سيتم إغلاق التذكرة خلال 5 ثوانٍ...');
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

client.login(process.env.DISCORD_TOKEN);
