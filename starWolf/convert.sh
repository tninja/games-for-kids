
## get image size
identify -ping -format '%w %h' ./tractor.jpg

## resize
convert ./tractor.jpg -resize 5% small_tractor.jpg

convert ./tiger.jpg -resize 20% small_tiger.jpg

## get mp3

youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=EfSIuA6WAj0

youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=MlmliItxt0Q

youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=mD4GbGmvNRc

youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=gA07ObAfGzg&list=UU5PYHgAzJ1wLEidB58SK6Xw&index=148

brew upgrade youtube-dl

youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=nwq249Me9Yk

pip3 install pylint pycheck

pip2 install pylint pycheck

df -h
