input_file="icon_1024x1024.png"
output_iconset_name="icon.iconset"

# info on this script gained from : https://www.codingforentrepreneurs.com/blog/create-icns-icons-for-macos-apps

rm -r $output_iconset_name
mkdir -p  $output_iconset_name

declare -a ARR=( 16 32 32 64 128 256 256 512 512 1024  )
declare -a NAMES=( 16x16.png 16x16@2x.png 32x32.png 32x32@2x.png 128x128.png 128x128@2x.png 256x256.png 256x256@2x.png 512x512.png 512x512@2x.png   )
images=""
g=0
for i in "${ARR[@]}"
do
   : 
	echo $i
	sips -z $i $i $input_file --out "${output_iconset_name}/icon_${NAMES[$g]}"
	images=$images" ${output_iconset_name}/icon_${NAMES[$g]}"
   	g=$((g+1))
done

iconutil -c icns $output_iconset_name
echo $images
convert $images -colors 1024 icon.ico


rm -R $output_iconset_name
