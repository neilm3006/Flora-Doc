import Augmentor

# Load your dataset folder
p = Augmentor.Pipeline(r"C:\Users\neilm\Desktop\FY\ASEP\SEM I\PlantDiseasesDataset\Training\eggplant\Wilt Disease")

# Recommended augmentations for plant disease classification
p.rotate(probability=0.7, max_left_rotation=20, max_right_rotation=20)
p.flip_left_right(probability=0.5)
p.zoom_random(probability=0.6, percentage_area=0.85)
p.random_brightness(probability=0.5, min_factor=0.8, max_factor=1.2)
p.random_contrast(probability=0.5, min_factor=0.8, max_factor=1.2)
p.random_color(probability=0.4, min_factor=0.9, max_factor=1.1)
p.shear(probability=0.4, max_shear_left=10, max_shear_right=10)
p.crop_random(probability=0.4, percentage_area=0.8)
p.random_distortion(probability=0.3, grid_width=4, grid_height=4, magnitude=4)
p.greyscale(probability=0.2)  # Optional, try both with/without and compare model accuracy

# Generate 1000 augmented images
p.sample(1000)

print("Done! 1000 plant disease–optimized augmented images saved to output folder.")
