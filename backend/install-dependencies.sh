#!/bin/bash
# Install build tools required for sqlite3 compilation
apt-get update && apt-get install -y \
  build-essential \
  python3 \
  git
