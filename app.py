from flask import Flask, render_template, request, send_file, jsonify, redirect, url_for
import os
import sys

# Ensure we can import from src
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.report_generator import ReportGenerator

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB limit

# Constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(BASE_DIR, 'template', '四川分公司车险第49周经营分析模板.html')
OUTPUT_PATH = os.path.join(BASE_DIR, 'output', '经营分析周报_web.html')
MAPPING_PATH = os.path.join(BASE_DIR, 'reference', 'business_type_mapping.json')
YEAR_PLANS_PATH = os.path.join(BASE_DIR, 'reference', 'year-plans.json')
THRESHOLDS_PATH = os.path.join(BASE_DIR, 'reference', 'thresholds.json')

@app.route('/')
def index():
    return render_template('upload.html')

@app.route('/report')
def view_report():
    if os.path.exists(OUTPUT_PATH):
        return send_file(OUTPUT_PATH, mimetype='text/html')
    else:
        return "报告尚未生成，请先上传数据。", 404

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '没有上传文件'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    if file:
        try:
            filename = 'uploaded_temp.csv'
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])
                
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Generate Report
            generator = ReportGenerator(
                filepath, 
                TEMPLATE_PATH, 
                OUTPUT_PATH, 
                MAPPING_PATH,
                year_plans_path=YEAR_PLANS_PATH,
                thresholds_path=THRESHOLDS_PATH
            )
            generator.generate()
            
            # Return success JSON with redirect URL
            return jsonify({
                'status': 'success', 
                'redirect_url': url_for('view_report')
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("启动 Web 服务: http://localhost:5001")
    app.run(debug=True, port=5001)
