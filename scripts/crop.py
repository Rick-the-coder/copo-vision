from PIL import Image

img_path = '/Users/shaileshbujade/.gemini/antigravity-ide/brain/8464ddb2-c280-436d-b333-51a749e9f88a/media__1786801914499.png'
img = Image.open(img_path)

# Top right icon (approximate)
# X: 395 to 455, Y: 45 to 105
icon = img.crop((395, 45, 455, 105))
icon.save('profile_icon.png')

# Main photo (approximate)
# X: 40 to 170, Y: 230 to 390
# Let's verify by checking some pixels or just saving and we can see if it's correct
main_photo = img.crop((40, 235, 175, 395))
main_photo.save('main_photo.png')
print("Images cropped and saved.")
