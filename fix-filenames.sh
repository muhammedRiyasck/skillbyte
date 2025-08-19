FOLDERS=("client" "server")

# Skip these paths
EXCLUDE="node_modules|.git|dist|build"

for folder in "${FOLDERS[@]}"; do
  echo "í´ Processing $folder ..."
  find "$folder" -type f \
    | grep -Ev "$EXCLUDE" \
    | while read -r file; do
        dir=$(dirname "$file")
        base=$(basename "$file")
        ext="${base##*.}"
        name="${base%.*}"
        # Convert to PascalCase
        newname=$(echo "$name" | sed -E 's/(^|_|-)([a-z])/\U\2/g')
        newfile="$dir/$newname.$ext"

        if [ "$file" != "$newfile" ]; then
          echo "Renaming: $file -> $newfile"
          git mv "$file" "$newfile" 2>/dev/null || mv "$file" "$newfile"
        fi
    done
done
