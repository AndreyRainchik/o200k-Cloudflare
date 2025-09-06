# O200k Tokenizer - Cloudflare Deployment Guide

This application provides a web interface and API for encoding and decoding text using the O200k tokenizer (compatible with GPT-4o and GPT-4o-mini).

## 🚀 Quick Deployment

### Prerequisites
- A Cloudflare account
- Node.js installed locally
- Wrangler CLI installed (`npm install -g wrangler`)

### Deployment (Cloudflare Worker)

1. **Clone/Download the files:**
   - `worker.js` - The main worker script
   - `package.json` - Dependencies
   - `wrangler.toml` - Wrangler configuration

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

4. **Deploy the worker:**
   ```bash
   wrangler deploy
   ```

5. **Note your worker URL:**
   After deployment, you'll get a URL like: `https://o200k-tokenizer.your-subdomain.workers.dev`

## 🔧 API Endpoints

### POST /encode
Encode text to O200k tokens.

**Request:**
```json
{
  "text": "Hello, world!"
}
```

**Response:**
```json
{
  "tokens": [15339, 11, 1917, 0],
  "tokenCount": 4,
  "text": "Hello, world!"
}
```

### POST /decode
Decode O200k tokens to text.

**Request:**
```json
{
  "tokens": [15339, 11, 1917, 0]
}
```

**Response:**
```json
{
  "text": "Hello, world!",
  "tokens": [15339, 11, 1917, 0],
  "tokenCount": 4
}
```

## 🎯 Features

- **Real-time tokenization** using the O200k encoding (GPT-4o compatible)
- **Bidirectional conversion** - encode text to tokens and decode tokens to text
- **Modern, responsive UI** with dark gradients and animations
- **Copy to clipboard** functionality
- **Error handling** with user-friendly messages
- **CORS enabled** for cross-origin requests
- **Mobile-responsive** design

## 🔒 Security Notes

- The API is open and doesn't require authentication
- Consider adding rate limiting for production use
- All processing happens server-side for consistency

## 🛠️ Customization

### Changing the Tokenizer
To use a different tokenizer, modify line 22 in `worker.js`:
```javascript
const encoding = new Tiktoken(cl100k_base); // For GPT-3.5/GPT-4
// or
const encoding = new Tiktoken(p50k_base);   // For older models
```

### Adding Authentication
Add API key validation in the worker:
```javascript
const apiKey = request.headers.get('Authorization');
if (apiKey !== 'Bearer YOUR_API_KEY') {
  return new Response('Unauthorized', { status: 401 });
}
```

### Custom Styling
Modify the CSS in `styles.css` to match your brand colors and styling preferences.

## 📊 Token Limits

- Cloudflare Workers have a 128KB request/response limit
- Very long texts may need to be chunked
- The O200k tokenizer is optimized for modern language models

## 🐛 Troubleshooting

### Common Issues:

1. **"Failed to encode text" errors:**
   - Check that your worker URL is correct
   - Ensure CORS is properly configured
   - Verify the worker is deployed and running

2. **"Invalid token sequence" errors:**
   - Ensure tokens are valid integers
   - Check for typos in comma-separated token lists

3. **Worker not deploying:**
   - Run `wrangler login` again
   - Check your `wrangler.toml` configuration
   - Ensure dependencies are installed

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this tokenizer tool!