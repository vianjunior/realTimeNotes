import React from 'react'
import { StyleSheet, Text, View, YellowBox, FlatList } from 'react-native'
import { Input } from 'react-native-elements'
import io from 'socket.io-client'

YellowBox.ignoreWarnings([
  'Unrecognized WebSocket connection option(s) '+
  '`agent`, `perMessageDeflate`, `pfx`, `key`, '+
  '`passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. '+
  'Did you mean to put these under `headers`?',
  'VirtualizedList: missing keys for items, '+
  'make sure to specify a key property on each '+
  'item or provide a custom keyExtractor.'
]);

export default class App extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      nota: '',
      notas: [],
      usuariosConectados: 0
    }
  }

  componentDidMount(){
    this.socket = io('http://10.1.1.154:3000')
    this.socket.on('usuarios conectados', data => {
      this.setState({ usuariosConectados: data })
    })
    this.socket.on('notas iniciais', data => {
      this.setState({ notas: data})
    })
  }

  adicionarNota(){
    if (this.state.nota) {
      this.socket.emit('nova nota', {nota: this.state.nota})
      this.setState({ nota: '' })
    }
  }

  render(){
    return (
      <View style={estilos.container}>
        <View style={estilos.viewInput}>
          <Input 
            inputContainerStyle={{ borderBottomWidth: 0 }}
            value={this.state.nota}
            onSubmitEditing={() => this.adicionarNota()}
            onChangeText={nota => {this.setState({ nota })}}
          />
        </View>
        <View style={estilos.usuariosConectados}>
          <Text>Usuários conectados: {this.state.usuariosConectados}</Text>
        </View>
        <View style={estilos.flatList}>
          <FlatList
            data={this.state.notas}
            renderItem={({ item }) => {
              return(
                <View style={estilos.itensFlatList}>
                  <Text>{item}</Text>
                </View>
              )
            }}
          />
        </View>
      </View>
    )
  }
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    //justifyContent: 'center',
  },
  viewInput: {
    marginTop: 35,
    width: 320,
    borderWidth: 0.5,
    borderRadius: 15,
    marginHorizontal: 10 
  },
  usuariosConectados: {
    marginTop: 10,
    width: 320,
    marginHorizontal: 10 
  },
  flatList: {
    marginTop: 10,
    width: 320,
    marginHorizontal: 10 
  },
  itensFlatList: {
    marginTop: 2,
    width: 320,
    height: 30,
    borderWidth: 0.2,
    justifyContent: 'center',
    alignItems: 'center'
  }
});