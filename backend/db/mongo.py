"""MongoDB helper utilities with structured logging.

This module provides a Motor client and convenience helpers used by the
backend routers. Logging (via the standard library) and `coloredlogs` are
installed to improve traceability during development and in production.
"""
from typing import Any, Dict, List, Optional
import os
import logging
from bson import ObjectId

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

# Try to enable colored logs if available; fall back to basic logging.
try:
	import coloredlogs

	coloredlogs.install(level=os.getenv("LOG_LEVEL", "INFO"))
except Exception:
	logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))

logger = logging.getLogger("portfolio.db.mongo")

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "portfolio")

_client: Optional[AsyncIOMotorClient] = None


def get_client() -> AsyncIOMotorClient:
	"""Return a singleton AsyncIOMotorClient.

	The connection creation is logged at INFO level; subsequent calls are
	returned from a cached client (DEBUG log).
	"""
	global _client
	if _client is None:
		logger.info("Creating new AsyncIOMotorClient to %s", MONGO_URI)
		try:
			_client = AsyncIOMotorClient(MONGO_URI)
			logger.debug("Mongo client created: %s", _client)
		except Exception as exc:  # pragma: no cover - defensive
			logger.exception("Failed to create Mongo client: %s", exc)
			raise
	else:
		logger.debug("Re-using existing Mongo client")
	return _client


def get_db() -> AsyncIOMotorDatabase:
	"""Return the configured AsyncIOMotorDatabase instance.

	Calling this will ensure the client is initialized and will log the DB
	name used for operations.
	"""
	client = get_client()
	logger.debug("Using MongoDB database: %s", MONGO_DB)
	return client[MONGO_DB]


async def get_skill_documents(
	filter: Optional[Dict[str, Any]] = None,
	sort: Optional[List[tuple]] = None,
	limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
	"""Fetch skill documents from the `skills` collection.

	Parameters mirror the MongoDB query options used by the routers.
	Logs the query parameters at DEBUG level and returns the matching docs.
	"""
	db = get_db()
	if filter is None:
		filter = {}
	logger.debug("Querying skills with filter=%s sort=%s limit=%s", filter, sort, limit)
	try:
		cursor = db.skills.find(filter)
		if sort:
			cursor = cursor.sort(sort)
		docs = await cursor.to_list(length=limit or None)
		logger.info("Fetched %d skill documents", len(docs))
		return docs
	except Exception as exc:
		logger.exception("Error fetching skills: %s", exc)
		return []


async def get_certification_documents(
	filter: Optional[Dict[str, Any]] = None,
	sort: Optional[List[tuple]] = None,
	limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
	"""Fetch certification documents from the `certifications` collection.

	Mirrors :func:`get_skill_documents` and logs the query and results.
	"""
	db = get_db()
	if filter is None:
		filter = {}
	logger.debug(
		"Querying certifications with filter=%s sort=%s limit=%s", filter, sort, limit
	)
	try:
		cursor = db.certifications.find(filter)
		if sort:
			cursor = cursor.sort(sort)
		docs = await cursor.to_list(length=limit or None)
		logger.info("Fetched %d certification documents", len(docs))
		return docs
	except Exception as exc:
		logger.exception("Error fetching certifications: %s", exc)
		return []


async def get_admin_user_by_email(email: str) -> Optional[Dict[str, Any]]:
	"""Fetch a single admin user document by email."""
	db = get_db()
	try:
		doc = await db.admin_users.find_one({"email": email})
		return doc
	except Exception as exc:
		logger.exception("Error fetching admin user by email %s: %s", email, exc)
		return None


async def insert_admin_user(document: Dict[str, Any]) -> str:
	"""Upsert an admin user document by email. Returns the ObjectId string."""
	db = get_db()
	try:
		result = await db.admin_users.update_one(
			{"email": document["email"]},
			{"$set": document},
			upsert=True,
		)
		if result.upserted_id:
			return str(result.upserted_id)
		# If matched (not upserted), fetch the existing _id
		existing = await db.admin_users.find_one({"email": document["email"]}, {"_id": 1})
		return str(existing["_id"]) if existing else ""
	except Exception as exc:
		logger.exception("Error upserting admin user: %s", exc)
		raise


async def get_project_documents(
	filter: Optional[Dict[str, Any]] = None,
	sort: Optional[List[tuple]] = None,
	limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
	"""Fetch project documents from the `projects` collection."""
	db = get_db()
	if filter is None:
		filter = {}
	logger.debug("Querying projects with filter=%s sort=%s limit=%s", filter, sort, limit)
	try:
		cursor = db.projects.find(filter)
		if sort:
			cursor = cursor.sort(sort)
		docs = await cursor.to_list(length=limit or None)
		logger.info("Fetched %d project documents", len(docs))
		return docs
	except Exception as exc:
		logger.exception("Error fetching projects: %s", exc)
		return []


async def get_music_documents(
	filter: Optional[Dict[str, Any]] = None,
	sort: Optional[List[tuple]] = None,
	limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
	"""Fetch music documents from the `music` collection."""
	db = get_db()
	if filter is None:
		filter = {}
	logger.debug("Querying music with filter=%s sort=%s limit=%s", filter, sort, limit)
	try:
		cursor = db.music.find(filter)
		if sort:
			cursor = cursor.sort(sort)
		docs = await cursor.to_list(length=limit or None)
		logger.info("Fetched %d music documents", len(docs))
		return docs
	except Exception as exc:
		logger.exception("Error fetching music: %s", exc)
		return []


async def get_blog_documents(
	filter: Optional[Dict[str, Any]] = None,
	sort: Optional[List[tuple]] = None,
	limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
	"""Fetch blog entry documents from the `blog_entries` collection."""
	db = get_db()
	if filter is None:
		filter = {}
	logger.debug("Querying blog_entries with filter=%s sort=%s limit=%s", filter, sort, limit)
	try:
		cursor = db.blog_entries.find(filter)
		if sort:
			cursor = cursor.sort(sort)
		docs = await cursor.to_list(length=limit or None)
		logger.info("Fetched %d blog entry documents", len(docs))
		return docs
	except Exception as exc:
		logger.exception("Error fetching blog entries: %s", exc)
		return []


async def get_document_by_slug(collection_name: str, slug: str) -> Optional[Dict[str, Any]]:
	"""Fetch a single document by its slug field."""
	db = get_db()
	try:
		doc = await db[collection_name].find_one({"slug": slug})
		return doc
	except Exception as exc:
		logger.exception("Error fetching %s by slug %s: %s", collection_name, slug, exc)
		return None


async def get_document_by_id(collection_name: str, doc_id: str) -> Optional[Dict[str, Any]]:
	"""Fetch a single document by its ObjectId string."""
	db = get_db()
	try:
		doc = await db[collection_name].find_one({"_id": ObjectId(doc_id)})
		return doc
	except Exception as exc:
		logger.exception("Error fetching %s by id %s: %s", collection_name, doc_id, exc)
		return None


async def insert_document(collection_name: str, document: Dict[str, Any]) -> str:
	"""Insert a document and return its new ObjectId as a string."""
	db = get_db()
	try:
		result = await db[collection_name].insert_one(document)
		return str(result.inserted_id)
	except Exception as exc:
		logger.exception("Error inserting into %s: %s", collection_name, exc)
		raise


async def update_document(collection_name: str, doc_id: str, update_data: Dict[str, Any]) -> bool:
	"""Update a document by id. Returns True if matched/modified."""
	db = get_db()
	try:
		result = await db[collection_name].update_one(
			{"_id": ObjectId(doc_id)},
			{"$set": update_data}
		)
		return result.matched_count > 0
	except Exception as exc:
		logger.exception("Error updating %s id %s: %s", collection_name, doc_id, exc)
		raise


async def delete_document(collection_name: str, doc_id: str) -> bool:
	"""Delete a document by id. Returns True if deleted."""
	db = get_db()
	try:
		result = await db[collection_name].delete_one({"_id": ObjectId(doc_id)})
		return result.deleted_count > 0
	except Exception as exc:
		logger.exception("Error deleting %s id %s: %s", collection_name, doc_id, exc)
		raise


__all__ = [
	"get_client",
	"get_db",
	"get_skill_documents",
	"get_certification_documents",
	"get_project_documents",
	"get_music_documents",
	"get_blog_documents",
	"get_document_by_slug",
	"get_admin_user_by_email",
	"insert_admin_user",
	"get_document_by_id",
	"insert_document",
	"update_document",
	"delete_document",
]
