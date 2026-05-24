#!/bin/bash
# Generate images.json manifest for all category folders

BASE="images"
OUTPUT="images.json"

echo "{" > "$OUTPUT"

first_cat=true
for CAT_DIR in "$BASE"/*/; do
  CAT=$(basename "$CAT_DIR")
  [[ "$CAT" == "about" || "$CAT" == "hero-bg" || "$CAT" == "logo"* ]] && continue

  $first_cat || echo "," >> "$OUTPUT"
  first_cat=false

  echo "  \"$CAT\": [" >> "$OUTPUT"

  # Check if category has subdirectories
  SUBDIRS=()
  for D in "$CAT_DIR"*/; do
    [ -d "$D" ] && SUBDIRS+=("$(basename "$D")")
  done

  if [ ${#SUBDIRS[@]} -gt 0 ]; then
    # Category with groups
    echo "    {" >> "$OUTPUT"
    echo "      \"type\": \"grouped\"," >> "$OUTPUT"
    echo "      \"groups\": [" >> "$OUTPUT"

    first_group=true
    for GROUP in "${SUBDIRS[@]}"; do
      $first_group || echo "        }," >> "$OUTPUT"
      first_group=false

      # Determine media type
      EXT_COUNT=$(find "$CAT_DIR/$GROUP" -maxdepth 1 -type f ! -name '.DS_Store' | head -1 | grep -oE '\.(mp4|webm|mov)$' | wc -l)
      if [ -f "$CAT_DIR/$GROUP/1.mp4" ] || ls "$CAT_DIR/$GROUP"/*.mp4 2>/dev/null | head -1 >/dev/null; then
        MEDIA="video"
      else
        MEDIA="image"
      fi

      echo "        {" >> "$OUTPUT"
      echo "          \"name\": \"$GROUP\"," >> "$OUTPUT"
      echo "          \"label\": \"$GROUP\"," >> "$OUTPUT"
      echo "          \"folder\": \"$BASE/$CAT/$GROUP\"," >> "$OUTPUT"
      echo "          \"mediaType\": \"$MEDIA\"," >> "$OUTPUT"

      # List files
      FILES=$(find "$CAT_DIR/$GROUP" -maxdepth 1 -type f ! -name '.DS_Store' ! -name 'README.txt' | sort -V)
      echo -n "          \"items\": [" >> "$OUTPUT"
      first_file=true
      while IFS= read -r f; do
        $first_file || echo -n ", " >> "$OUTPUT"
        first_file=false
        FNAME=$(basename "$f")
        TITLE="${FNAME%.*}"
        echo -n "\"$BASE/$CAT/$GROUP/$FNAME\"" >> "$OUTPUT"
      done <<< "$FILES"
      echo "]" >> "$OUTPUT"
    done
    echo "        }" >> "$OUTPUT"
    echo "      ]" >> "$OUTPUT"
    echo "    }" >> "$OUTPUT"

  else
    # Flat category (no groups)
    FILES=$(find "$CAT_DIR" -maxdepth 1 -type f ! -name '.DS_Store' ! -name 'README.txt' | sort -V)
    echo -n "    " >> "$OUTPUT"
    first_file=true
    while IFS= read -r f; do
      $first_file || echo -n ", " >> "$OUTPUT"
      first_file=false
      FNAME=$(basename "$f")
      echo -n "\"$BASE/$CAT/$FNAME\"" >> "$OUTPUT"
    done <<< "$FILES"
    echo "" >> "$OUTPUT"
    echo "  ]" >> "$OUTPUT"
  fi
done

echo "}" >> "$OUTPUT"
echo "Generated $OUTPUT"
