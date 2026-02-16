#!/usr/bin/env node
/**
 * File to Link Bot - Malayalam Edition
 * Created for Zeus ⚡
 */

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 3000;
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// Create downloads directory
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 File Link Bot Started!');
console.log('⚡ By Zeus');

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'Bro';
  
  const welcomeMsg = `
╔══════════════════════╗
║  🌟 FILE LINK BOT 🌟  ║
╚══════════════════════╝

👋 Hey ${name}! Welcome!

━━━━━━━━━━━━━━━━━━

**What I Do:**

📎 Send me ANY file
🔗 Get instant download link
⚡ Lightning fast processing
🔒 100% secure & private

━━━━━━━━━━━━━━━━━━

**Supported Files:**

📄 Documents (PDF, DOCX, etc.)
🖼️ Images (JPG, PNG, etc.)
🎥 Videos (MP4, AVI, etc.)
🎵 Audio (MP3, WAV, etc.)
📦 Archives (ZIP, RAR, etc.)
💾 And everything else!

━━━━━━━━━━━━━━━━━━

**How to Use:**

1️⃣ Send me any file
2️⃣ Wait a few seconds ⏳
3️⃣ Get your download link! 🎉
4️⃣ Share it anywhere! 🌍

━━━━━━━━━━━━━━━━━━

⚡ **Commands:**
/start - Show this message
/help - Get help & support

━━━━━━━━━━━━━━━━━━

Ready? Send me a file! 📎

💫 By Zeus ⚡
  `;
  
  bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' });
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMsg = `
🆘 **HELP CENTER** 🆘

━━━━━━━━━━━━━━━━━━

**How It Works:**

Simply send me any file and I'll instantly convert it to a shareable download link!

━━━━━━━━━━━━━━━━━━

**Features:**

✅ Supports all file types
✅ Lightning fast processing
✅ Secure & encrypted links
✅ Auto-delete after 24 hours
✅ Unlimited uploads
✅ No registration needed

━━━━━━━━━━━━━━━━━━

**Having Issues?**

• File won't upload? Check file size
• Link not working? It may have expired
• Bot not responding? Try /start

━━━━━━━━━━━━━━━━━━

**Need More Help?**
Contact: @ZEUS_IS_HERE ⚡
  `;
  
  bot.sendMessage(chatId, helpMsg, { parse_mode: 'Markdown' });
});

// Handle all file types
bot.on('document', async (msg) => await handleFile(msg, msg.document));
bot.on('photo', async (msg) => await handleFile(msg, msg.photo[msg.photo.length - 1]));
bot.on('video', async (msg) => await handleFile(msg, msg.video));
bot.on('audio', async (msg) => await handleFile(msg, msg.audio));
bot.on('voice', async (msg) => await handleFile(msg, msg.voice));
bot.on('video_note', async (msg) => await handleFile(msg, msg.video_note));

// Main file handler
async function handleFile(msg, fileInfo) {
  const chatId = msg.chat.id;
  const fileId = fileInfo.file_id;
  
  try {
    // Processing message
    const processingMsg = await bot.sendMessage(chatId, 
      '⏳ **Processing...**\n\n' +
      '📥 Downloading your file\n' +
      '🔄 Please wait...',
      { parse_mode: 'Markdown' }
    );
    
    // Get file from Telegram
    const file = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    
    // Generate unique filename
    const originalName = fileInfo.file_name || `file_${Date.now()}`;
    const fileHash = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName) || '';
    const safeName = `${fileHash}${extension}`;
    const localPath = path.join(DOWNLOAD_DIR, safeName);
    
    // Download file
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    // Generate download link
    const downloadLink = `${PUBLIC_URL}/download/${safeName}`;
    
    // Get file size
    const stats = fs.statSync(localPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    const sizeDisplay = stats.size >= 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;
    
    // Delete processing message
    await bot.deleteMessage(chatId, processingMsg.message_id);
    
    // Success message
    const successMsg = `
╔══════════════════════╗
║     ✅ FILE READY! ✅     ║
╚══════════════════════╝

━━━━━━━━━━━━━━━━━━

📄 **File Details:**

🏷️ Name: \`${originalName}\`
📊 Size: \`${sizeDisplay}\`
🔑 ID: \`${fileHash}\`
📅 Date: \`${new Date().toLocaleString('en-GB')}\`

━━━━━━━━━━━━━━━━━━

🔗 **Download Link:**

${downloadLink}

━━━━━━━━━━━━━━━━━━

📋 **Instructions:**

✅ Click the link to download
✅ Share with anyone
✅ Works on all devices
✅ No login needed!

━━━━━━━━━━━━━━━━━━

⚠️ **Note:**

⏰ Link valid for 24 hours
🗑️ Auto-deletes after expiry

━━━━━━━━━━━━━━━━━━

Need another file? Send it! 📎

⚡ By Zeus
    `;
    
    await bot.sendMessage(chatId, successMsg, { parse_mode: 'Markdown' });
    
    console.log(`✅ File: ${originalName} -> ${downloadLink}`);
    
  } catch (error) {
    console.error('Error:', error);
    
    const errorMsg = `
❌ **Error Occurred!**

━━━━━━━━━━━━━━━━━━

Sorry, couldn't process your file.

**Possible reasons:**
• File too large
• Network issue
• Temporary problem

━━━━━━━━━━━━━━━━━━

**Try:**
1️⃣ Upload again
2️⃣ Check file size
3️⃣ Different file

━━━━━━━━━━━━━━━━━━

Contact: @ZEUS_IS_HERE ⚡
    `;
    
    await bot.sendMessage(chatId, errorMsg, { parse_mode: 'Markdown' });
  }
}

// Express web server
const app = express();

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(DOWNLOAD_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, filename);
    console.log(`📥 Downloaded: ${filename}`);
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 - File Not Found</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .container { padding: 40px; }
          h1 { font-size: 120px; margin-bottom: 20px; }
          h2 { font-size: 32px; margin-bottom: 15px; }
          p { font-size: 20px; opacity: 0.9; }
          .emoji { font-size: 80px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="emoji">😕</div>
          <h1>404</h1>
          <h2>File Not Found</h2>
          <p>File may be expired or doesn't exist</p>
          <p style="margin-top: 30px;">⚡ File Link Bot by Zeus</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>File Link Bot</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container { padding: 40px; max-width: 600px; }
        h1 { font-size: 48px; margin-bottom: 20px; }
        p { font-size: 22px; margin-bottom: 15px; line-height: 1.6; }
        .emoji { font-size: 80px; margin-bottom: 30px; }
        .feature {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          margin: 10px 0;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">⚡🤖⚡</div>
        <h1>File Link Bot</h1>
        <p>Upload files to Telegram bot & get instant download links!</p>
        
        <div style="margin: 40px 0;">
          <div class="feature">📎 All File Types Supported</div>
          <div class="feature">🔗 Instant Link Generation</div>
          <div class="feature">🔒 Secure & Private</div>
          <div class="feature">⚡ Lightning Fast</div>
        </div>
        
        <p style="margin-top: 40px; font-size: 18px;">
          Created with ❤️ by Zeus ⚡
        </p>
      </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📁 Files at: ${PUBLIC_URL}/download/`);
});

// Cleanup old files (24 hours)
setInterval(() => {
  const now = Date.now();
  try {
    const files = fs.readdirSync(DOWNLOAD_DIR);
    
    files.forEach(file => {
      const filePath = path.join(DOWNLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      
      if (age > 24 * 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted: ${file}`);
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, 60 * 60 * 1000); // Every hour

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 Bye!');
  bot.stopPolling();
  process.exit(0);
});
