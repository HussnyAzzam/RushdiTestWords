#!/bin/bash

# TextShare Tool - Installation Helper Script
# Run this script to install all required dependencies

echo "🚀 TextShare Tool - Installing Dependencies"
echo "==========================================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing required packages..."
echo ""

# Install dependencies
packages=(
    "tweetnacl@^1.0.3"
    "tweetnacl-util@^0.15.1"
    "docx@^8.10.0"
    "qrcode@^1.5.3"
)

for package in "${packages[@]}"; do
    echo "Installing: $package"
    npm install "$package"
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install $package"
        exit 1
    fi
done

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Add QRCode library to public/index.html:"
echo '   <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>'
echo ""
echo "2. Import TextShare component in your app:"
echo "   import TextShare from './components/TextShare'"
echo ""
echo "3. Configure settings in src/config/appSettings.json"
echo ""
echo "4. Read TextShare_SETUP.md for detailed setup instructions"
echo ""
echo "🎉 TextShare is ready to use!"
