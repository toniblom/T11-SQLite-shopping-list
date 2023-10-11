import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Header } from '@rneui/themed';
import { Input } from '@rneui/themed';
import { Button } from '@rneui/themed';
import { ListItem } from '@rneui/themed';
import { Icon } from '@rneui/themed';

const db = SQLite.openDatabase('coursedb.db');

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [lines, setLines] = useState([]);

  // Create the database
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists line (id integer primary key not null unique, product text, amount text);');
    }, null, updateList);
  }, []);

  // Save item
  const saveItem = () => {
    db.transaction(tx => {
      tx.executeSql('insert into line (product, amount) values (?, ?);', [product, amount]);
    }, null, updateList
    )
  }

  // Update itemlist
  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from line;', [], (_, { rows }) =>
        setLines(rows._array)
      );
    });
  }

  // Delete item
  const deleteItem = (id) => {
    db.transaction(
      tx => {
        tx.executeSql(`delete from line where id = ?;`, [id]);
      }, null, updateList
    )
  }

  // Apparently no need to have const in front here
  renderItem = ({ item }) => (
    <ListItem bottomDivider>
      <View style={styles.listcontainer}>
        <ListItem.Content>
          <ListItem.Title>{item.product}</ListItem.Title>
          <ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
        </ListItem.Content>
        <Icon type="material" name="delete" color="red" onPress={() => deleteItem(item.id)} />
      </View>
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'SHOPPING LIST', style: { color: '#fff' } }}
      />

      <Input
        placeholder='Product' label='PRODUCT'
        onChangeText={product => setProduct(product)} value={product} />
      <Input
        placeholder='Amount' label='AMOUNT'
        onChangeText={amount => setAmount(amount)} value={amount} />

      <View style={styles.button}>
        <Button raised icon={{ name: 'save', color: 'white' }} onPress={saveItem} title="SAVE" />
      </View>

      <FlatList
        // Apparently both of these keyExtractors work:
        //keyExtractor={item => item.id.toString()}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        data={lines}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    //alignItems: 'center', // This caused a problem for some (?) reason
    justifyContent: 'center',
  },
  listcontainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  button: {
    // Allows to change the button screen width
    marginHorizontal: 80,
  },
});