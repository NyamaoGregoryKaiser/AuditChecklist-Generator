import openai
from django.conf import settings
import json

openai.api_key = settings.OPENAI_API_KEY

class AuditAIService:
    @staticmethod
    def generate_checklist(audit_data):
        """Generate audit checklist using OpenAI"""
        prompt = f"""
        Generate a comprehensive audit checklist for the following company:
        - Company: {audit_data['company_name']}
        - Industry: {audit_data['industry']}
        - Standard: {audit_data['standard']}
        - Size: {audit_data['company_size']}
        - Country: {audit_data['country']}
        
        Create 5-7 categories with 5-8 questions each. Return as JSON with this structure:
        {{
            "categories": [
                {{
                    "name": "Category Name",
                    "description": "Category description",
                    "questions": [
                        "Question 1 text",
                        "Question 2 text"
                    ]
                }}
            ]
        }}
        
        Focus on {audit_data['standard']} compliance requirements for {audit_data['industry']} industry.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert auditor. Generate comprehensive audit checklists in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            # Fallback checklist if AI fails
            return {
                "categories": [
                    {
                        "name": "Documentation Review",
                        "description": "Review of company documentation and policies",
                        "questions": [
                            "Are all required policies documented and up to date?",
                            "Is there evidence of regular policy reviews?",
                            "Are procedures clearly defined and accessible?",
                            "Is document control process implemented?",
                            "Are records maintained according to standards?"
                        ]
                    }
                ]
            }
    
    @staticmethod
    def generate_recommendations(audit_data, responses):
        """Generate recommendations based on audit responses"""
        scores_summary = []
        for category, questions in responses.items():
            avg_score = sum(questions.values()) / len(questions)
            scores_summary.append(f"{category}: {avg_score:.1f}/10")
        
        prompt = f"""
        Based on the audit results for {audit_data['company_name']} ({audit_data['industry']} industry, {audit_data['standard']} standard):
        
        Scores by category:
        {chr(10).join(scores_summary)}
        
        Provide specific, actionable recommendations to improve compliance. Focus on:
        1. Areas with scores below 7
        2. Industry-specific best practices
        3. {audit_data['standard']} requirements
        4. Priority actions (immediate vs long-term)
        
        Format as clear, numbered recommendations.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert compliance consultant. Provide specific, actionable recommendations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return "Unable to generate AI recommendations at this time. Please review low-scoring areas and consult with compliance experts." 