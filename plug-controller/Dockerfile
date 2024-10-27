FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/

EXPOSE 3000

CMD ["python", "main.py", "--host=0.0.0.0", "--port=5000"]