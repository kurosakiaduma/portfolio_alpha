#!/usr/bin/env python3
"""
Scan backend/routers for route handlers using POST/PUT/DELETE without
an admin dependency (Depends(get_current_admin)).

Usage: python scripts/check_admin_protection.py
Exits with code 1 when violations are found.
"""
import ast
import sys
from pathlib import Path


def has_admin_dep(func_def: ast.FunctionDef) -> bool:
    """Return True if any parameter default is Depends(get_current_admin)."""
    for default in func_def.args.defaults:
        # Looking for Depends(get_current_admin)
        if isinstance(default, ast.Call) and getattr(default.func, 'id', '') == 'Depends':
            # check first arg is get_current_admin
            if default.args:
                first = default.args[0]
                if isinstance(first, ast.Name) and first.id == 'get_current_admin':
                    return True
            # also allow lambda or attribute references
            for a in default.args:
                if isinstance(a, ast.Attribute) and getattr(a, 'attr', '') == 'get_current_admin':
                    return True
    return False


def scan_file(path: Path):
    src = path.read_text()
    tree = ast.parse(src, filename=str(path))
    violations = []

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            # inspect decorators
            for dec in node.decorator_list:
                # decorator of form @router.post(...)
                if isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute):
                    attr = dec.func.attr.lower()
                    if attr in ('post', 'put', 'delete'):
                        # Exempt common login endpoint name
                        if node.name in ('admin_login', 'login'):
                            continue
                        if not has_admin_dep(node):
                            # Additional heuristics: if function body calls get_current_admin directly,
                            # we do not flag (some endpoints may call the helper inside).
                            if 'get_current_admin' in src[node.lineno - 1: node.end_lineno if hasattr(node, 'end_lineno') else node.lineno + 5]:
                                continue
                            violations.append((path, node.name, node.lineno))
    return violations


def main():
    repo_root = Path(__file__).parent.parent
    routers = (repo_root / 'backend' / 'routers').glob('*.py')
    all_violations = []
    for f in routers:
        # skip __init__ and cached files
        if f.name.startswith('__') or f.suffix != '.py':
            continue
        v = scan_file(f)
        all_violations.extend(v)

    if all_violations:
        print('\nFound admin protection violations:')
        for path, func, lineno in all_violations:
            print(f" - {path.relative_to(repo_root)}:{lineno} -> function '{func}' is a POST/PUT/DELETE without Depends(get_current_admin)")
        print('\nPlease add a parameter like: current_user: dict = Depends(get_current_admin)')
        sys.exit(1)
    else:
        print('No unprotected POST/PUT/DELETE route handlers found.')
        sys.exit(0)


if __name__ == '__main__':
    main()
