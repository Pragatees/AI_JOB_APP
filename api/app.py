from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import re

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Configure Gemini API key
genai.configure(api_key="AIzaSyD7s27zUWqCJfg-rhGgcsqcSyYdJbZTh40")

generation_config = {
    "temperature": 0.9,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
)

@app.route("/", methods=["POST"])
def get_gemini_advice():
    try:
        data = request.get_json()
        job_role = data.get("role")

        if not job_role:
            return jsonify({"error": "Job role is missing"}), 400

        prompt = f"""
        You are an expert career counselor and interview coach.

        For the job role: {job_role}, provide a response in JSON format with the following structure:

        {{
            "advice": "Brief career advice specific to the job role",
            "tips": ["Tip 1", "Tip 2", "Tip 3"],
            "questions": ["Mock Question 1", "Mock Question 2", "Mock Question 3"]
        }}

        Output only the JSON. Do not include backticks, markdown, or any explanations.
        """

        chat = model.start_chat(history=[])
        response = chat.send_message(prompt)

        # Clean and extract JSON safely using regex
        cleaned_text = response.text.strip()

        # Remove triple backticks or code fences if present
        cleaned_text = re.sub(r"^```(?:json)?|```$", "", cleaned_text, flags=re.MULTILINE).strip()

        try:
            parsed = json.loads(cleaned_text)
            return jsonify(parsed), 200
        except json.JSONDecodeError as e:
            print("JSON Decode Error:", e)
            print("Raw Gemini Output:", cleaned_text)
            return jsonify({
                "error": "Failed to parse Gemini response as JSON",
                "raw": cleaned_text
            }), 500

    except Exception as e:
        print("Server Error:", e)
        return jsonify({"error": "Internal Server Error"}), 500


@app.route("/analyze-resume", methods=["POST"])
def analyze_resume():
    try:
        data = request.get_json()
        resume = data.get("resume")

        if not resume:
            return jsonify({"error": "Resume text is required"}), 400

        prompt = f"""
        Analyze this resume and suggest suitable job roles based on the skills, experience, and qualifications provided. Provide a detailed response in JSON format:
        
        Resume:
        {resume}
        
        Provide output in this exact JSON structure:
        {{
            "summary": "Brief summary of the resume",
            "suggestedRoles": ["List of 3-5 suggested job roles"],
            "strengths": ["List of 3-5 strengths"],
            "improvements": ["List of 3-5 areas for improvement"],
            "keywords": ["List of 8-12 relevant keywords to include"],
            "tips": ["List of 3-5 optimization tips for the resume"]
        }}
        
        Be specific and actionable in your recommendations. Focus on identifying job roles that align with the resume's content.
        """

        response = model.generate_content(prompt)
        
        # Clean and parse the response
        cleaned_text = response.text.strip()
        cleaned_text = re.sub(r"^```(?:json)?|```$", "", cleaned_text, flags=re.MULTILINE).strip()
        
        try:
            analysis = json.loads(cleaned_text)
            return jsonify(analysis), 200
        except json.JSONDecodeError as e:
            print("JSON Decode Error:", e)
            print("Raw Gemini Output:", cleaned_text)
            return jsonify({"error": "Failed to parse analysis response", "raw": cleaned_text}), 500

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/generate-cover-letter", methods=["POST"])
def generate_cover_letter():
    try:
        data = request.get_json()
        resume = data.get("resume")
        company = data.get("company")
        role = data.get("role")

        if not all([resume, company, role]):
            return jsonify({"error": "Resume, company, and role are required"}), 400

        prompt = f"""
        Write a professional cover letter for a {role} position at {company} based on this resume:
        
        Resume:
        {resume}
        
        The cover letter should:
        - Be about 250-350 words
        - Highlight relevant skills and experiences
        - Show enthusiasm for the specific role and company
        - Be professional but not overly formal
        - Include a strong opening and closing
        
        Return the cover letter in this JSON format:
        {{
            "coverLetter": "The generated cover letter text here"
        }}
        """

        response = model.generate_content(prompt)
        
        # Clean and parse the response
        cleaned_text = response.text.strip()
        cleaned_text = re.sub(r"^```(?:json)?|```$", "", cleaned_text, flags=re.MULTILINE).strip()
        
        try:
            result = json.loads(cleaned_text)
            return jsonify(result), 200
        except json.JSONDecodeError as e:
            print("JSON Decode Error:", e)
            print("Raw Gemini Output:", cleaned_text)
            return jsonify({"error": "Failed to parse cover letter response"}), 500

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Internal server error"}), 500
    
    
@app.route("/analyze-skills", methods=["POST"])
def analyze_skills():
    try:
        data = request.get_json()
        skills = data.get("skills")
        job_roles = data.get("interestedJobRoles")

        if not skills or not job_roles:
            return jsonify({"error": "Skills and interested job roles are required"}), 400

        prompt = f"""
        You are an expert career counselor. Analyze the following skills and interested job roles to suggest skills to improve, additional skills to learn, and provide career advice.

        Skills: {', '.join(skills)}
        Interested Job Roles: {', '.join(job_roles)}

        Provide a response in JSON format with the following structure:
        {{
            "skillsToImprove": ["List of 3-5 skills to enhance for the job roles"],
            "additionalSkills": ["List of 3-5 new skills to learn for the job roles"],
            "careerAdvice": ["List of 3-5 pieces of career advice"]
        }}

        Be specific and actionable in your recommendations. Focus on aligning the suggestions with the job roles provided.
        """

        response = model.generate_content(prompt)
        
        # Clean and parse the response
        cleaned_text = response.text.strip()
        cleaned_text = re.sub(r"^```(?:json)?|```$", "", cleaned_text, flags=re.MULTILINE).strip()
        
        try:
            analysis = json.loads(cleaned_text)
            return jsonify(analysis), 200
        except json.JSONDecodeError as e:
            print("JSON Decode Error:", e)
            print("Raw Gemini Output:", cleaned_text)
            return jsonify({"error": "Failed to parse analysis response", "raw": cleaned_text}), 500

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Internal server error"}), 500
    
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=2000, debug=True)