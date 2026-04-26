import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator, // ← Add this import
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler'; // ← Fix: Import from gesture-handler
import { SafeAreaView } from 'react-native-safe-area-context'; // ← Fix: Import from safe-area-context
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function MainScreen({ navigation }) {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = [];
      snapshot.forEach((doc) => {
        notesList.push({ id: doc.id, ...doc.data() });
      });
      setNotes(notesList);
    });
    return () => unsubscribe();
  }, []);

  const addNote = async () => {
    if (!note.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    setIsAdding(true);
    try {
      await addDoc(collection(db, 'notes'), {
        text: note,
        userId: user?.email,
        createdAt: new Date().toISOString(),
      });
      setNote('');
      Alert.alert('Success', 'Note added successfully');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to add note');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteNote = async (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'notes', id));
              Alert.alert('Success', 'Note deleted');
            } catch (error) {
              console.log(error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login');
            } catch (error) {
              console.log(error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const renderRightActions = (id) => {
    return (
      <TouchableOpacity
        style={styles.deleteSwipeArea}
        onPress={() => deleteNote(id)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteSwipeText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderNote = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <View style={styles.noteItem}>
        <View style={styles.noteContent}>
          <Text style={styles.noteText}>{item.text}</Text>
          <View style={styles.noteFooter}>
            <View style={styles.userContainer}>
              <Ionicons name="person-circle-outline" size={14} color="#999" />
              <Text style={styles.noteUser}>{item.userId?.split('@')[0] || 'User'}</Text>
            </View>
            <Text style={styles.noteTime}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.userEmail}>{user?.email?.split('@')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Add Note Section */}
        <View style={styles.addNoteContainer}>
          <Text style={styles.sectionTitle}>Create New Note</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor="#aaa"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.saveButton, !note.trim() && styles.saveButtonDisabled]}
              onPress={addNote}
              disabled={isAdding || !note.trim()}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Add Note</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes List */}
        <View style={styles.notesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Notes</Text>
            <Text style={styles.noteCount}>{notes.length} notes</Text>
          </View>

          <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.notesList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="create-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No notes yet</Text>
                <Text style={styles.emptySubtext}>Tap above to add your first note</Text>
              </View>
            }
          />
        </View>

        {/* Movies Button */}
        <TouchableOpacity
          style={styles.moviesButton}
          onPress={() => navigation.navigate('Movies')}
          activeOpacity={0.9}
        >
          <Text style={styles.moviesButtonText}>Explore Movies</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#999',
  },
  userEmail: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 30,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addNoteContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2a7469',
    marginBottom: 12,
  },
  noteCount: {
    fontSize: 12,
    color: '#999',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#2a7469',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  notesContainer: {
    flex: 1,
  },
  notesList: {
    paddingBottom: 20,
  },
  noteItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteContent: {
    padding: 16,
  },
  noteText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteUser: {
    fontSize: 11,
    color: '#8ab8b7',
  },
  noteTime: {
    fontSize: 11,
    color: '#bbb',
  },
  deleteSwipeArea: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 6,
  },
  deleteSwipeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ccc',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  moviesButton: {
    backgroundColor: '#2a7469c4',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    shadowColor: '#2a7469',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  moviesButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});