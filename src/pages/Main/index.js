import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Keyboard, ActivityIndicator } from 'react-native';

import AwesomeAlert from 'react-native-awesome-alerts';

import api from '~/services/api';
import getRealm from '~/services/realm';

import Repository from '~/components/Repository';

import {
  Container, Title, Form, Input, Submit, List,
} from './styles';

export default function Main() {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [deleteId, setDeleteId] = useState(0);
  const [inputEditable, setInputEditable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadRepositories() {
      const realm = await getRealm();

      console.tron.log(realm.path);

      const data = realm.objects('Repository').sorted('stars', true);
      setRepositories(data);
    }

    loadRepositories();
  }, []);

  async function destroyRepository() {
    const realm = await getRealm();
    const deleteRepository = realm.objectForPrimaryKey('Repository', deleteId);
    realm.write(() => {
      realm.delete(deleteRepository);
    });

    const data = realm.objects('Repository').sorted('stars', true);
    setRepositories(data);

    setShowAlert(false);
  }

  async function saveRepository(repository) {
    const data = {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
    };

    const realm = await getRealm();
    realm.write(() => {
      realm.create('Repository', data, 'modified');
    });

    return data;
  }

  async function handleAddRepository() {
    if (!loading) {
      setInputEditable(false);
      setLoading(true);
      try {
        const response = await api.get(`/repos/${input}`);
        await saveRepository(response.data);

        setInput('');
        setInputEditable(true);
        setLoading(false);

        setError(false);
        Keyboard.dismiss();
      } catch (err) {
        setError(true);
      }
    }
  }

  async function handleRefreshRepository(repository) {
    const response = await api.get(`/repos/${repository.fullName}`);

    const data = await saveRepository(response.data);

    setRepositories(repositories.map(repo => (repo.id === data.id ? data : repo)));
  }

  return (
    <Container>
      <Title>Repositórios</Title>
      <Form>
        <Input
          value={input}
          error={error}
          onChangeText={setInput}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Procurar repositório..."
          editable={inputEditable}
        />
        <Submit onPress={handleAddRepository}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="add" size={22} color="#fff" />
          )}
        </Submit>
      </Form>
      <List
        keyboardShouldPersistTaps="handled"
        data={repositories}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <Repository
            data={item}
            onRefresh={() => handleRefreshRepository(item)}
            onDestroy={() => {
              setDeleteId(item.id);
              setShowAlert(true);
            }}
          />
        )}
      />

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Remove repository"
        message="Are you sure you want to remove this repository?"
        closeOnTouchOutside
        closeOnHardwareBackPress={false}
        showCancelButton
        showConfirmButton
        cancelText="No, cancel"
        confirmText="Yes, remove it"
        confirmButtonColor="#DD6B55"
        onCancelPressed={() => {
          setShowAlert(false);
        }}
        onConfirmPressed={() => {
          destroyRepository();
        }}
        onDismiss={() => {
          setShowAlert(false);
        }}
      />
    </Container>
  );
}
