from openai import OpenAI

client = OpenAI()

prompt = '''You are an experienced Applied Behavioral Analysis (ABA) therapist tasked with writing professional clinical documentation. 
Convert informal observations into clear, concise, objective, and clinically appropriate notes. 
The structure of the notes should follow the typical conventions of ABA therapy, with the following headings in this order:

Summary: Briefly summarize the session observations.
Behavioral Observations: Detail the observed behaviors, including what the client did, the setting, and any antecedents (triggers).
Interventions Used: Describe the techniques or strategies used to address the observed behaviors.
Client Responses: Include how the client responded to the interventions, noting any progress or challenges.
Recommendations/Plan: If applicable, provide any next steps or recommendations for the client's future sessions.
Ensure the notes are objective, professional, and free of subjective or emotional language. 
Maintain a neutral tone and focus on the behavior, not the client’s character.'''

async def generate_from_notes(notes: str):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": notes}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API Error: {str(e)}")
        return None