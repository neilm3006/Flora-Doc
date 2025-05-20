// Model URL configuration for multiple models
const modelURLs = [
    { name: "Bell Pepper", url: "https://teachablemachine.withgoogle.com/models/OxzgWkGk_/" },
    { name: "Broad Bean", url: "https://teachablemachine.withgoogle.com/models/pR3mtOtI9/" },
    { name: "Lettuce", url: "https://teachablemachine.withgoogle.com/models/pR3mtOtI9/" },
    { name: "Melon / Watermelon", url: "https://teachablemachine.withgoogle.com/models/pR3mtOtI9/" },
    { name: "Spring Onion", url: "https://teachablemachine.withgoogle.com/models/pR3mtOtI9/" },
    { name: "Cucumber", url: "https://teachablemachine.withgoogle.com/models/pR3mtOtI9/" },
    { name: "Cauliflower", url: "https://teachablemachine.withgoogle.com/models/XIKFZKjFj/" },
    { name: "Chili", url: "https://teachablemachine.withgoogle.com/models/SocdBIvui/" },
    { name: "Eggplant", url: "https://teachablemachine.withgoogle.com/models/o5GkIdXad/" },
    { name: "Potato", url: "https://teachablemachine.withgoogle.com/models/JpkBMpMgS/" },
    { name: "Strawberry", url: "https://teachablemachine.withgoogle.com/models/fw2u-ZH8B/" },
    { name: "Tomato", url: "https://teachablemachine.withgoogle.com/models/87ieGRB7l/" }
];
let selectedModel = null; // Store the selected model
let models = [];
let maxPredictionsArray = [];
let webcam;
let isWebcamPredicting = false;
let imageUpload, fileUploadContainer; // Declare variables that will be used across functions

// Load the selected model when chosen from the dropdown
async function loadSelectedModel() {
    const modelURL = selectedModel.url + "model.json";
    const metadataURL = selectedModel.url + "metadata.json";
    const loadedModel = await tmImage.load(modelURL, metadataURL);
    models[0] = loadedModel; // Only one model to be used at a time
    maxPredictionsArray[0] = loadedModel.getTotalClasses();
    console.log("Selected model loaded:", selectedModel.name);
}

// Enhanced helper function to create and show modal for different purposes
function showModal(options) {
    // Default options
    const defaults = {
        title: 'Information',
        message: '',
        type: 'info', // info, success, warning, error
        input: false, // Whether to show input field
        inputType: 'text',
        inputLabel: '',
        inputPlaceholder: '',
        cancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        onConfirm: () => {}
    };

    // Merge provided options with defaults
    const settings = { ...defaults, ...options };
    
    // Create modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = `modal ${settings.type}`;
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitleContainer = document.createElement('div');
    modalTitleContainer.className = 'modal-title-container';
    
    // Add icon based on type
    const modalIcon = document.createElement('div');
    modalIcon.className = `modal-icon ${settings.type}`;
    
    // Set the icon content based on type
    switch(settings.type) {
        case 'info':
            modalIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>';
            break;
        case 'success':
            modalIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
            break;
        case 'warning':
            modalIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
            break;
        case 'error':
            modalIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
            break;
    }
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = settings.title;
    
    modalTitleContainer.appendChild(modalIcon);
    modalTitleContainer.appendChild(modalTitle);
    
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modalOverlay)) {
                document.body.removeChild(modalOverlay);
            }
        }, 300);
    });
    
    modalHeader.appendChild(modalTitleContainer);
    modalHeader.appendChild(closeButton);
    
    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = settings.input ? 'modal-body' : 'modal-body message-only';
    
    // Add message if provided
    if (settings.message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'modal-message';
        messageElement.textContent = settings.message;
        modalBody.appendChild(messageElement);
    }
    
    let input = null;
    // Add input field if requested
    if (settings.input) {
        const label = document.createElement('label');
        label.setAttribute('for', 'modal-input');
        label.textContent = settings.inputLabel;
        
        input = document.createElement('input');
        input.type = settings.inputType;
        input.className = 'styled-input';
        input.id = 'modal-input';
        input.placeholder = settings.inputPlaceholder;
        if (settings.inputType === 'number') {
            input.min = '0';
            input.step = '0.1';
        }
        
        if (settings.inputNote) {
            const inputNote = document.createElement('div');
            inputNote.className = 'amount-info';
            inputNote.textContent = settings.inputNote;
            modalBody.appendChild(label);
            modalBody.appendChild(input);
            modalBody.appendChild(inputNote);
        } else {
            modalBody.appendChild(label);
            modalBody.appendChild(input);
        }
    }
    
    // Create modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    
    // Add cancel button if requested
    if (settings.cancelButton) {
        const cancelButton = document.createElement('button');
        cancelButton.className = 'button';
        cancelButton.textContent = settings.cancelButtonText;
        cancelButton.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(modalOverlay)) {
                    document.body.removeChild(modalOverlay);
                }
            }, 300);
        });
        modalFooter.appendChild(cancelButton);
    }
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'button';
    confirmButton.textContent = settings.confirmButtonText;
    confirmButton.addEventListener('click', () => {
        if (settings.input) {
            const inputValue = input.value;
            if (!inputValue && settings.inputRequired !== false) {
                input.classList.add('input-error');
                setTimeout(() => {
                    input.classList.remove('input-error');
                }, 500);
                input.focus();
                return;
            }
            settings.onConfirm(inputValue);
        } else {
            settings.onConfirm();
        }
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            if (document.body.contains(modalOverlay)) {
                document.body.removeChild(modalOverlay);
            }
        }, 300);
    });
    
    modalFooter.appendChild(confirmButton);
    
    // Assemble modal
    modal.appendChild(modalHeader);
    modal.appendChild(modalBody);
    modal.appendChild(modalFooter);
    
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    // Show modal with animation
    setTimeout(() => {
        modalOverlay.classList.add('active');
        if (input) {
            input.focus();
        }
    }, 10);
    
    // Handle keypress events
    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(modalOverlay)) {
                    document.body.removeChild(modalOverlay);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            }, 300);
        } else if (e.key === 'Enter') {
            confirmButton.click();
        }
    }
    
    document.addEventListener('keydown', handleKeyDown);
}

// Helper function for showing fertilizer/pesticide modals (for backward compatibility)
function showApplicationModal(title, type, onConfirm) {
    showModal({
        title: title,
        type: 'info',
        input: true,
        inputType: 'number',
        inputLabel: `Enter amount of ${type} per liter of water:`,
        inputPlaceholder: 'e.g., X ml/L',
        inputNote:'____',
        confirmButtonText: 'Apply',
        onConfirm: onConfirm
    });
}

// Handle image upload and prediction with selected model
async function handleImageUpload(file) {
    if (!selectedModel) {
        showModal({
            title: 'No Plant Selected',
            message: 'Please select a plant model first!',
            type: 'warning',
            cancelButton: false
        });
        return;
    }

    const imagePreview = document.getElementById('imagePreview');
    const labelContainer = document.getElementById('label-container');
    const uploadContainer = document.getElementById('file-upload-container');
    
    // Add loading state
    uploadContainer.classList.add('loading');
    
    // Clear previous preview
    imagePreview.innerHTML = '';
    labelContainer.innerHTML = '<div>Processing...</div>';

    // Create image preview
    const img = document.createElement('img');
    imagePreview.appendChild(img);

    // Read and preview image
    const reader = new FileReader();
    reader.onload = async (e) => {
        img.src = e.target.result;
        img.onload = async () => {
            try {
                // Load the selected model if not already loaded
                if (!models[0]) await loadSelectedModel();

                // Predict using the selected model
                const model = models[0];
                const predictions = await model.predict(img);

                // Sort predictions by probability
                const sortedPredictions = predictions
                    .map((p, index) => ({ ...p, index }))
                    .sort((a, b) => b.probability - a.probability);

                // Display results
                labelContainer.innerHTML = `<h3>Predictions for ${selectedModel.name}</h3>`;
                sortedPredictions.forEach((prediction, index) => {
                    const probability = prediction.probability.toFixed(2);
                    const percentage = (probability * 100).toFixed(0);
                    const predictionDiv = document.createElement('div');
                    predictionDiv.className = 'prediction-item';
                    if (index === 0) {
                        predictionDiv.classList.add('top-prediction');
                    }
                    predictionDiv.innerHTML = `
                        <span>${prediction.className}</span>
                        <span class="percentage">${percentage}%</span>
                    `;
                    labelContainer.appendChild(predictionDiv);
                });

                // Add success message
                imagePreview.classList.add('processed');
                const successMessage = document.createElement('div');
                successMessage.className = 'upload-success';
                successMessage.textContent = 'Analysis Complete!';
                imagePreview.appendChild(successMessage);
                
                // Remove effects after animation
                setTimeout(() => {
                    imagePreview.classList.remove('processed');
                    successMessage.remove();
                }, 2000);

            } catch (error) {
                labelContainer.innerHTML = `
                    <div class="prediction-item error">
                        <span>Error processing image. Please try again.</span>
                        <span>${error.message}</span>
                    </div>`;
                console.error('Prediction error:', error);
            } finally {
                uploadContainer.classList.remove('loading');
            }
        };
    };
    reader.readAsDataURL(file);
}


async function init() {
    // Check if a model is selected
    if (!selectedModel) {
        showModal({
            title: 'No Plant Selected',
            message: 'Please select a plant model first!',
            type: 'warning',
            cancelButton: false
        });
        return;
    }
    
    // Load the model if not loaded yet
    if (!models[0]) {
        try {
            await loadSelectedModel();
        } catch (error) {
            showModal({
                title: 'Model Loading Failed',
                message: 'Failed to load the model. Please try again.',
                type: 'error',
                cancelButton: false
            });
            return;
        }
    }
    
    const flip = true; // whether to flip the webcam image (true for front camera, false for rear)
    webcam = new tmImage.Webcam(200, 200, flip); // Create a new webcam object with dimensions
    
    try {
        await webcam.setup(); // Request access to the webcam
        await webcam.play(); // Start the webcam stream
        
        document.getElementById('webcam-container').appendChild(webcam.canvas); // Show the webcam feed
        isWebcamPredicting = true;
        window.requestAnimationFrame(loop); // Start running predictions
    } catch (error) {
        showModal({
            title: 'Camera Access Failed',
            message: 'Failed to access the webcam. Please ensure your camera is connected and you have granted permission to use it.',
            type: 'error',
            cancelButton: false
        });
    }
}

async function loop() {
    if (!webcam) return;
    
    webcam.update(); // Update the webcam frame
    
    if (isWebcamPredicting && models[0]) {
        try {
            // Predict using the selected model
            const prediction = await models[0].predict(webcam.canvas);
            
            // Display prediction results
            const labelContainer = document.getElementById('label-container');
            if (!labelContainer) return;
            
            labelContainer.innerHTML = `<h3>Live Detection for ${selectedModel.name}</h3>`;
            
            // Sort predictions by probability
            const sortedPredictions = prediction
                .map((p, index) => ({ ...p, index }))
                .sort((a, b) => b.probability - a.probability);
                
            sortedPredictions.forEach((p, i) => {
                const probability = p.probability.toFixed(2);
                const percentage = (probability * 100).toFixed(0);
                const predictionDiv = document.createElement('div');
                predictionDiv.className = 'prediction-item';
                if (i === 0) {
                    predictionDiv.classList.add('top-prediction');
                }
                predictionDiv.innerHTML = `
                    <span>${p.className}</span>
                    <span class="percentage">${percentage}%</span>
                `;
                labelContainer.appendChild(predictionDiv);
            });
        } catch (error) {
            console.error("Prediction error:", error);
        }
    }
    
    if (isWebcamPredicting) {
        window.requestAnimationFrame(loop); // Continue running the loop only if still predicting
    }
}

function stopWebcam() {
    if (webcam) {
        webcam.stop();
        isWebcamPredicting = false;
        
        // Remove the webcam canvas
        const webcamContainer = document.getElementById('webcam-container');
        if (webcamContainer) {
            while (webcamContainer.firstChild) {
                webcamContainer.removeChild(webcamContainer.firstChild);
            }
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM references
    imageUpload = document.getElementById('imageUpload');
    fileUploadContainer = document.getElementById('file-upload-container');
    const modelSelect = document.getElementById('modelSelect');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check if elements exist
    if (!imageUpload || !fileUploadContainer || !modelSelect || !themeToggle) {
        console.error("Required DOM elements not found");
        return;
    }

    // Populate the dropdown with model options
    modelURLs.forEach((model, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = model.name;
        modelSelect.appendChild(option);
    });

    // Handle model selection
    modelSelect.addEventListener('change', (e) => {
        const selectedIndex = e.target.value;
        selectedModel = modelURLs[selectedIndex]; // Set the selected model
        console.log(`Selected model: ${selectedModel.name}`);
        
        // Clear previous model if any
        if (models[0]) {
            models = [];
            maxPredictionsArray = [];
        }
        
        // Stop webcam if running
        if (isWebcamPredicting) {
            stopWebcam();
            const labelContainer = document.getElementById('label-container');
            if (labelContainer) {
                labelContainer.innerHTML = '';
            }
        }
    });
    
    // Replace inline styles with proper CSS classes
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.insertAdjacentHTML('afterend', '<button type="button" onclick="stopWebcam()" class="start-button danger">Stop Camera</button>');
    }
    
    // Add button click handlers for fertilizer and pesticide buttons
    const fertilizer1Btn = document.getElementById('fertilizer1');
    const fertilizer2Btn = document.getElementById('fertilizer2');
    const pesticideBtn = document.getElementById('pesticide');

    if (fertilizer1Btn) {
        fertilizer1Btn.addEventListener('click', () => {
            showApplicationModal('Organic Fertilizer Application', 'fertilizer', (amount) => {
                // Success message after application
                const labelContainer = document.getElementById('label-container');
                if (!labelContainer) return;
                
                const successMessage = document.createElement('div');
                successMessage.className = 'prediction-item top-prediction';
                successMessage.innerHTML = `<span>Organic Fertilizer applied successfully!</span><span>${amount} ml/L</span>`;
                labelContainer.prepend(successMessage);
                
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => {
                        if (successMessage.parentNode) {
                            successMessage.parentNode.removeChild(successMessage);
                        }
                    }, 500);
                }, 3000);
            });
        });
    }

    if (fertilizer2Btn) {
        fertilizer2Btn.addEventListener('click', () => {
            showApplicationModal('Chemical Fertilizer Application', 'fertilizer', (amount) => {
                // Success message after application
                const labelContainer = document.getElementById('label-container');
                if (!labelContainer) return;
                
                const successMessage = document.createElement('div');
                successMessage.className = 'prediction-item top-prediction';
                successMessage.innerHTML = `<span>Chemical Fertilizer applied successfully!</span><span>${amount} ml/L</span>`;
                labelContainer.prepend(successMessage);
                
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => {
                        if (successMessage.parentNode) {
                            successMessage.parentNode.removeChild(successMessage);
                        }
                    }, 500);
                }, 3000);
            });
        });
    }

    if (pesticideBtn) {
        pesticideBtn.addEventListener('click', () => {
            showApplicationModal('Pesticide Application', 'pesticide', (amount) => {
                // Success message after application
                const labelContainer = document.getElementById('label-container');
                if (!labelContainer) return;
                
                const successMessage = document.createElement('div');
                successMessage.className = 'prediction-item top-prediction';
                successMessage.innerHTML = `<span>Pesticide applied successfully!</span><span>${amount} ml/L</span>`;
                labelContainer.prepend(successMessage);
                
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => {
                        if (successMessage.parentNode) {
                            successMessage.parentNode.removeChild(successMessage);
                        }
                    }, 500);
                }, 3000);
            });
        });
    }
    
    // Check if dark mode is already set in localStorage
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    }

    // Theme toggle button click event
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark'); // Save the theme setting
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light'); // Save the theme setting
        }
    });
    
    // File upload handling (drag and drop)
    if (fileUploadContainer) {
        fileUploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadContainer.style.borderColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--button-hover').trim();
        });

        fileUploadContainer.addEventListener('dragleave', (e) => {
            e.preventDefault();
            fileUploadContainer.style.borderColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--button-bg').trim();
        });

        fileUploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageUpload(file);
            }
        });
    }

    // Handle file input change
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageUpload(file);
            }
        });
    }
    
});


