FROM python:3.13-slim AS build

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc libffi-dev libssl-dev cargo pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
COPY pyproject.toml ./
COPY . ./

RUN python -m pip install --upgrade pip setuptools wheel \
    && python -m pip install --no-cache-dir -r requirements.txt \
    && python -m pip install --no-cache-dir .

FROM python:3.13-slim

WORKDIR /app

# Copy installed packages and binaries from builder
COPY --from=build /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=build /usr/local/bin /usr/local/bin

# FIX: Copy the source code files from the build stage into the final /app directory
COPY --from=build /app /app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]