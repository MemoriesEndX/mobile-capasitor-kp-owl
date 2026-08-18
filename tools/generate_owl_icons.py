import os
from PIL import Image

SOURCE_PATH = "src/assets/owl.png"

def load_owl_logo():
    if not os.path.exists(SOURCE_PATH):
        raise FileNotFoundError(f"Source image not found at {SOURCE_PATH}")
    return Image.open(SOURCE_PATH).convert("RGBA")

def create_padded_logo_on_canvas(source_img, canvas_width, canvas_height, background_color=(255, 255, 255, 255), logo_scale=0.75):
    # Create target canvas
    canvas = Image.new("RGBA", (canvas_width, canvas_height), background_color)
    
    # Calculate available bounding area for logo
    max_logo_w = int(canvas_width * logo_scale)
    max_logo_h = int(canvas_height * logo_scale)
    
    src_w, src_h = source_img.size
    aspect_ratio = src_w / src_h
    
    # Fit logo inside max_logo_w and max_logo_h while preserving aspect ratio
    if max_logo_w / aspect_ratio <= max_logo_h:
        new_w = max_logo_w
        new_h = int(max_logo_w / aspect_ratio)
    else:
        new_h = max_logo_h
        new_w = int(max_logo_h * aspect_ratio)
        
    resized_logo = source_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # Center logo on canvas
    paste_x = (canvas_width - new_w) // 2
    paste_y = (canvas_height - new_h) // 2
    
    canvas.paste(resized_logo, (paste_x, paste_y), resized_logo)
    return canvas

def generate_android_icons(source_img):
    print("Generating Android Launcher Icons...")
    
    # Android mipmap densities for legacy launcher icons (canvas size, foreground safe size)
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    # Adaptive foreground canvas size (108dp equivalent)
    adaptive_densities = {
        "mipmap-mdpi": 108,
        "mipmap-hdpi": 162,
        "mipmap-xhdpi": 216,
        "mipmap-xxhdpi": 324,
        "mipmap-xxxhdpi": 432,
    }

    for folder, size in densities.items():
        out_dir = os.path.join("android/app/src/main/res", folder)
        os.makedirs(out_dir, exist_ok=True)
        
        # Legacy square & round launcher icon (White background + centered logo)
        icon_img = create_padded_logo_on_canvas(source_img, size, size, background_color=(255, 255, 255, 255), logo_scale=0.8)
        icon_img.save(os.path.join(out_dir, "ic_launcher.png"), "PNG")
        icon_img.save(os.path.join(out_dir, "ic_launcher_round.png"), "PNG")
        
    for folder, size in adaptive_densities.items():
        out_dir = os.path.join("android/app/src/main/res", folder)
        os.makedirs(out_dir, exist_ok=True)
        
        # Adaptive foreground (Transparent background, centered logo inside 60% inner safe zone)
        fg_img = create_padded_logo_on_canvas(source_img, size, size, background_color=(0, 0, 0, 0), logo_scale=0.6)
        fg_img.save(os.path.join(out_dir, "ic_launcher_foreground.png"), "PNG")

def generate_android_splashes(source_img):
    print("Generating Android Splash Assets...")
    
    splash_dirs = [
        ("drawable", 1080, 1920),
        ("drawable-port-mdpi", 320, 480),
        ("drawable-port-hdpi", 480, 800),
        ("drawable-port-xhdpi", 720, 1280),
        ("drawable-port-xxhdpi", 960, 1600),
        ("drawable-port-xxxhdpi", 1280, 1920),
        ("drawable-land-mdpi", 480, 320),
        ("drawable-land-hdpi", 800, 480),
        ("drawable-land-xhdpi", 1280, 720),
        ("drawable-land-xxhdpi", 1600, 960),
        ("drawable-land-xxxhdpi", 1920, 1280),
    ]
    
    for folder, w, h in splash_dirs:
        out_dir = os.path.join("android/app/src/main/res", folder)
        os.makedirs(out_dir, exist_ok=True)
        
        splash_img = create_padded_logo_on_canvas(source_img, w, h, background_color=(255, 255, 255, 255), logo_scale=0.55)
        splash_img.save(os.path.join(out_dir, "splash.png"), "PNG")

def generate_ios_assets(source_img):
    print("Generating iOS AppIcon & Splash Assets...")
    
    ios_appicon_dir = "ios/App/App/Assets.xcassets/AppIcon.appiconset"
    os.makedirs(ios_appicon_dir, exist_ok=True)
    
    # Generate 1024x1024 universal app icon for iOS
    app_icon_1024 = create_padded_logo_on_canvas(source_img, 1024, 1024, background_color=(255, 255, 255, 255), logo_scale=0.75)
    app_icon_1024.save(os.path.join(ios_appicon_dir, "AppIcon-512@2x.png"), "PNG")
    
    # iOS Splash Screen assets
    ios_splash_dir = "ios/App/App/Assets.xcassets/Splash.imageset"
    os.makedirs(ios_splash_dir, exist_ok=True)
    
    splash_2732 = create_padded_logo_on_canvas(source_img, 2732, 2732, background_color=(255, 255, 255, 255), logo_scale=0.5)
    splash_2732.save(os.path.join(ios_splash_dir, "splash-2732x2732.png"), "PNG")
    splash_2732.save(os.path.join(ios_splash_dir, "splash-2732x2732-1.png"), "PNG")
    splash_2732.save(os.path.join(ios_splash_dir, "splash-2732x2732-2.png"), "PNG")

def main():
    logo = load_owl_logo()
    print(f"Loaded OWL logo successfully: size={logo.size}, mode={logo.mode}")
    generate_android_icons(logo)
    generate_android_splashes(logo)
    generate_ios_assets(logo)
    print("All branding assets generated successfully!")

if __name__ == "__main__":
    main()
