#!/usr/bin/env python3
"""
Gemini API Audit Checklist Generator
Generates customized audit checklists using Google's Gemini API
"""

import os
import json
import argparse
from datetime import datetime
import google.generativeai as genai
from typing import Optional, Dict, Any
from dotenv import load_dotenv

class AuditChecklistGenerator:
    def __init__(self, api_key: str):
        """Initialize the Gemini API client"""
        genai.configure(api_key=api_key)
        # Use Gemini 1.5 Flash which is available on free tier
        self.model = genai.GenerativeModel('models/gemini-1.5-flash')
    
    def generate_checklist(self, 
                          audit_type: str, 
                          organization: str = "", 
                          industry: str = "", 
                          specific_requirements: str = "",
                          complexity_level: str = "intermediate") -> str:
        """
        Generate an audit checklist based on input parameters
        
        Args:
            audit_type: Type of audit (e.g., "IT Security", "Financial", "Compliance")
            organization: Name/type of organization being audited
            industry: Industry sector (e.g., "Healthcare", "Finance", "Manufacturing")
            specific_requirements: Any specific requirements or focus areas
            complexity_level: "basic", "intermediate", or "advanced"
        """
        
        # Construct the prompt
        prompt = f"""
Create a comprehensive audit checklist for the following requirements:

**Audit Type:** {audit_type}
**Organization:** {organization if organization else "General Organization"}
**Industry:** {industry if industry else "General"}
**Complexity Level:** {complexity_level}
**Specific Requirements:** {specific_requirements if specific_requirements else "Standard requirements"}

Please generate a detailed audit checklist with the following format:

Category 1: [Category Name]
- Question 1
- Question 2
- Question 3

Category 2: [Category Name]
- Question 1
- Question 2
- Question 3

And so on...

Requirements:
1. Use 4-6 main categories relevant to the audit type
2. Each category should have 5-8 specific questions
3. Questions should be clear and actionable
4. Focus on the specific industry and requirements provided
5. Adjust complexity based on the specified level
6. Include questions about compliance with relevant laws and regulations
7. Questions should be specific to the organization type

Do not include any markdown formatting, tables, or additional metadata. Just provide the categories and questions in the format shown above.
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating checklist: {str(e)}"
    
    def save_checklist(self, checklist: str, filename: str = None) -> str:
        """Save the generated checklist to a file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"audit_checklist_{timestamp}.md"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(checklist)
            return filename
        except Exception as e:
            return f"Error saving file: {str(e)}"

def main():
    # Load environment variables from .env file
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("Error: GEMINI_API_KEY not found in .env file")
        print("Please create a .env file with your API key:")
        print("GEMINI_API_KEY=your_api_key_here")
        return

    parser = argparse.ArgumentParser(description='Generate audit checklists using Gemini API')
    parser.add_argument('--audit-type', help='Type of audit (e.g., "IT Security", "Financial")')
    parser.add_argument('--organization', help='Organization name or type')
    parser.add_argument('--industry', help='Industry sector')
    parser.add_argument('--requirements', help='Specific requirements or focus areas')
    parser.add_argument('--complexity', choices=['basic', 'intermediate', 'advanced'], 
                       default='intermediate', help='Complexity level of the audit')
    parser.add_argument('--output', help='Output filename (optional)')
    parser.add_argument('--interactive', action='store_true', help='Run in interactive mode')
    
    args = parser.parse_args()
    
    # Initialize the generator
    generator = AuditChecklistGenerator(api_key)
    
    if args.interactive or not args.audit_type:
        # Interactive mode
        print("=== Gemini API Audit Checklist Generator ===\n")
        
        audit_type = input("Enter audit type (e.g., IT Security, Financial, Compliance): ").strip()
        organization = input("Enter organization name/type (optional): ").strip()
        industry = input("Enter industry sector (optional): ").strip()
        requirements = input("Enter specific requirements (optional): ").strip()
        
        complexity_options = ["basic", "intermediate", "advanced"]
        print(f"Select complexity level: {', '.join(complexity_options)}")
        complexity = input("Complexity level [intermediate]: ").strip().lower()
        if complexity not in complexity_options:
            complexity = "intermediate"
        
        print("\nGenerating audit checklist...")
    else:
        # Command line mode
        audit_type = args.audit_type
        organization = args.organization or ""
        industry = args.industry or ""
        requirements = args.requirements or ""
        complexity = args.complexity
        
        print(f"Generating {complexity} audit checklist for: {audit_type}")
    
    # Generate the checklist
    checklist = generator.generate_checklist(
        audit_type=audit_type,
        organization=organization,
        industry=industry,
        specific_requirements=requirements,
        complexity_level=complexity
    )
    
    if checklist.startswith("Error"):
        print(f"❌ {checklist}")
        return
    
    # Display the checklist
    print("\n" + "="*80)
    print("GENERATED AUDIT CHECKLIST")
    print("="*80)
    print(checklist)
    print("="*80)
    
    # Save to file
    filename = generator.save_checklist(checklist, args.output)
    if not filename.startswith("Error"):
        print(f"\n✅ Checklist saved to: {filename}")
    else:
        print(f"\n❌ {filename}")

if __name__ == "__main__":
    main()