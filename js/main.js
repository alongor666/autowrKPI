/**
 * Main Entry Point for Application
 * Handles file upload and application initialization
 */
import App from './core/App.js';
import StaticReportGenerator from './services/WorkerService.js';

// Make App instance globally available
window.app = App;

// Main initialization variables
const fileInput = document.getElementById('fileInput');
const submitBtn = document.getElementById('submitBtn');
const dropZone = document.getElementById('dropZone');
const uploadForm = document.getElementById('uploadForm');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('errorMsg');
const fileInfo = document.getElementById('fileInfo');

let appController = null;

/**
 * Initialize application controller
 */
function initController() {
  try {
    // Use existing StaticReportGenerator for now
    // Will be refactored in Phase 2
    appController = new StaticReportGenerator();
  } catch (e) {
    console.error('Failed to init controller:', e);
    showError('系统初始化失败，请刷新页面');
  }
}

/**
 * Show error message
 */
function showError(message) {
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
  }
}

/**
 * Hide error message
 */
function hideError() {
  if (errorMsg) {
    errorMsg.style.display = 'none';
  }
}

/**
 * Show loading message
 */
function showLoading(message = '处理中...') {
  if (loading) {
    loading.textContent = message;
    loading.style.display = 'block';
  }
}

/**
 * Hide loading message
 */
function hideLoading() {
  if (loading) {
    loading.style.display = 'none';
  }
}

/**
 * Load file from URL parameter
 */
function loadFileFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const fileName = urlParams.get('file');

  if (fileName) {
    console.log('检测到文件参数:', fileName);

    fetch(`./${encodeURIComponent(fileName)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`文件加载失败: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const file = new File([blob], fileName, { type: 'text/csv' });
        console.log('文件加载成功:', fileName);

        // Create DataTransfer to simulate file selection
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        updateFileInfo(file);

        // Auto submit
        handleFileSubmit(new Event('submit'));
      })
      .catch(err => {
        console.error('URL文件加载失败:', err);
        showError('URL中的文件加载失败: ' + err.message);
      });
  }
}

/**
 * Update file info display
 */
function updateFileInfo(file) {
  if (fileInfo) {
    fileInfo.textContent = `已选择: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    fileInfo.style.display = 'block';
  }

  const uploadText = document.getElementById('uploadText');
  if (uploadText) {
    uploadText.textContent = file.name;
  }

  if (submitBtn) {
    submitBtn.style.display = 'block';
  }

  hideError();

  // Disable fileInput pointer events
  if (fileInput) {
    fileInput.style.pointerEvents = 'none';
  }
}

/**
 * Handle file input change
 */
function handleFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    updateFileInfo(file);
  }
}

/**
 * Handle drag and drop
 */
function setupDragAndDrop() {
  if (!dropZone) return;

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#a02724';
    dropZone.style.background = 'rgba(160, 39, 36, 0.05)';
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    dropZone.style.background = 'rgba(255, 255, 255, 0.5)';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#ccc';
    dropZone.style.background = 'rgba(255, 255, 255, 0.5)';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });
}

/**
 * Handle file submission
 */
async function handleFileSubmit(e) {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) return;

  showLoading('正在处理文件...');

  if (submitBtn) {
    submitBtn.style.display = 'none';
  }

  hideError();

  try {
    // Load data via controller
    const data = await appController.loadData(file, (msg) => {
      showLoading(msg);
    });

    // Initialize Dashboard with existing implementation
    // TODO: Phase 2 - Replace with App.init()
    if (window.Dashboard && typeof window.Dashboard.init === 'function') {
      window.Dashboard.init(data, appController.worker);
    }

    // Initialize new App (will take over in Phase 2)
    await App.init(data, appController.worker);

  } catch (err) {
    console.error('File processing failed:', err);
    showError('处理失败: ' + err.message);
    hideLoading();

    if (submitBtn) {
      submitBtn.style.display = 'block';
    }
  }
}

/**
 * Initialize main entry point
 */
function init() {
  // Initialize controller
  initController();

  // Setup event listeners
  if (fileInput) {
    fileInput.addEventListener('change', handleFileChange);
  }

  if (uploadForm) {
    uploadForm.addEventListener('submit', handleFileSubmit);
  }

  // Setup drag and drop
  setupDragAndDrop();

  // Load file from URL if parameter exists
  loadFileFromURL();

  console.log('[Main] Application initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
