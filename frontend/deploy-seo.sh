#!/bin/bash

# SEO and Nginx Deployment Script for taduma.me
# This script deploys robots.txt, sitemap, and nginx config updates

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTFOLIO_DIR="/home/portfolio/frontend"
PHYLO_ROBOTS_DIR="/var/www/phylo/apps/frontend/family-tree/public"
NGINX_CONF="/etc/nginx/sites-available/taduma.conf"

echo "🚀 Starting SEO Deployment for taduma.me"
echo "=========================================="

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1 FAILED"
        exit 1
    fi
}

# Step 1: Update Phylo robots.txt
echo ""
echo "📝 Step 1: Updating Phylo robots.txt..."
if [ -f "$SCRIPT_DIR/phylo-robots.txt" ]; then
    sudo cp "$SCRIPT_DIR/phylo-robots.txt" "$PHYLO_ROBOTS_DIR/robots.txt"
    check_status "Phylo robots.txt updated"
else
    echo "⚠️  Warning: phylo-robots.txt not found in script directory"
fi

# Step 2: Build portfolio frontend
echo ""
echo "🔨 Step 2: Building portfolio frontend..."
if [ -d "$PORTFOLIO_DIR" ]; then
    cd "$PORTFOLIO_DIR"
    npm run build
    check_status "Portfolio build completed"
else
    echo "❌ Portfolio directory not found: $PORTFOLIO_DIR"
    exit 1
fi

# Step 3: Backup and update nginx config
echo ""
echo "⚙️  Step 3: Updating nginx configuration..."
if [ -f "$SCRIPT_DIR/taduma.conf" ]; then
    # Create backup with timestamp
    BACKUP_FILE="$NGINX_CONF.backup-$(date +%Y%m%d-%H%M%S)"
    sudo cp "$NGINX_CONF" "$BACKUP_FILE"
    echo "📦 Backup created: $BACKUP_FILE"
    
    # Copy new config
    sudo cp "$SCRIPT_DIR/taduma.conf" "$NGINX_CONF"
    check_status "Nginx config updated"
    
    # Test nginx config
    echo ""
    echo "🧪 Testing nginx configuration..."
    sudo nginx -t
    check_status "Nginx config test passed"
else
    echo "❌ taduma.conf not found in script directory"
    exit 1
fi

# Step 4: Restart services
echo ""
echo "🔄 Step 4: Restarting services..."

# Check if using systemd or docker
if systemctl is-active --quiet portfolio-frontend 2>/dev/null; then
    echo "Restarting portfolio-frontend service..."
    sudo systemctl restart portfolio-frontend
    check_status "Portfolio frontend restarted"
elif [ -f "$PORTFOLIO_DIR/docker-compose.yml" ]; then
    echo "Restarting Docker containers..."
    cd "$PORTFOLIO_DIR"
    docker-compose restart frontend
    check_status "Docker frontend container restarted"
else
    echo "⚠️  Warning: No service manager found. Please restart manually."
fi

# Reload nginx
echo "Reloading nginx..."
sudo systemctl reload nginx
check_status "Nginx reloaded"

# Step 5: Verify deployment
echo ""
echo "🔍 Step 5: Verifying deployment..."
echo ""

# Test main robots.txt
echo "Testing https://taduma.me/robots.txt..."
if curl -sf https://taduma.me/robots.txt > /dev/null; then
    echo "✅ Main robots.txt is accessible"
else
    echo "❌ Main robots.txt NOT accessible"
fi

# Test phylo robots.txt
echo "Testing https://taduma.me/phylo/robots.txt..."
if curl -sf https://taduma.me/phylo/robots.txt > /dev/null; then
    echo "✅ Phylo robots.txt is accessible"
else
    echo "❌ Phylo robots.txt NOT accessible"
fi

# Test main sitemap
echo "Testing https://taduma.me/sitemap.xml..."
if curl -sf https://taduma.me/sitemap.xml > /dev/null; then
    echo "✅ Main sitemap is accessible"
else
    echo "❌ Main sitemap NOT accessible"
fi

# Test main site
echo "Testing https://taduma.me/..."
if curl -sf -o /dev/null https://taduma.me/; then
    echo "✅ Main site is accessible"
else
    echo "❌ Main site NOT accessible"
fi

# Test phylo site
echo "Testing https://taduma.me/phylo/..."
if curl -sf -o /dev/null https://taduma.me/phylo/; then
    echo "✅ Phylo site is accessible"
else
    echo "❌ Phylo site NOT accessible"
fi

echo ""
echo "=========================================="
echo "✨ Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Visit https://taduma.me/robots.txt to verify"
echo "2. Visit https://taduma.me/sitemap.xml to verify"
echo "3. Submit sitemap to Google Search Console"
echo "4. Submit sitemap to Bing Webmaster Tools"
echo ""
echo "For more details, see: SEO_DEPLOYMENT.md"
