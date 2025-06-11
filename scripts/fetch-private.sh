#!/bin/bash

echo "Downloading private.zip from private repo..."

curl -L -o private.zip "https://github.com/saiudja/code/blob/main/private.zip"

echo "Extracting private.zip..."

unzip -o private.zip -d ./private

rm private.zip

echo "Done."
