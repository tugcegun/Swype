import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

export function useFirestore(collectionName) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const colRef = collection(db, collectionName)

  const addDocument = async (data) => {
    try {
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
      })
      return { id: docRef.id, ...data }
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const updateDocument = async (id, data) => {
    try {
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, data)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const deleteDocument = async (id) => {
    try {
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  const getDocument = async (id) => {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const subscribeToQuery = (constraints = [], orderField = 'createdAt') => {
    setLoading(true)
    let q = colRef
    if (constraints.length > 0 || orderField) {
      const queryConstraints = constraints.map((c) => where(c.field, c.operator, c.value))
      if (orderField) {
        queryConstraints.push(orderBy(orderField, 'desc'))
      }
      q = query(colRef, ...queryConstraints)
    }

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        setDocuments(results)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    subscribeToQuery,
  }
}
