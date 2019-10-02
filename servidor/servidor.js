const Firebird = require('node-firebird-master')
const config = require('./config/config')
const configAcesso = config.conf.options
const porta = config.conf.portaServidor

const io = require('socket.io').listen(porta)

var socketCount = 0

// Listen ao banco firebird, aguardando por eventos disparados pela trigger
Firebird.attach(configAcesso, (err, db) => {
  db.attachEvent( (err, evento) => {
    if (err)
      return console.log('Error : ', err);

    evento.registerEvent(['insert_nota', 'update_nota', 'delete_nota'], err => {
        console.log('Pronto para receber os eventos de INSERT/UPDATE/DELETE')
    })

    // evento.unregisterEvent(["evt1"], err => {
    //      console.log('Removido registro do evendo evt2')
    // })

    evento.on('post_event', (name, count) => {
      //realiza novo select no banco ao receber alteração da trigger
      atualizaDados()        
    })

  })
})

io.on('connection', socket => {
  // socket conectado, incrementa contador
  socketCount++
  // dispara mensagens a todos os sockets informando o número de conexões
  io.emit('usuarios conectados', socketCount)

  socket.once('disconnect', function () {
    // Decrementa o número de socket conectados e informa usuários conectados
    socketCount--
    io.emit('usuarios conectados', socketCount)
  })

  socket.on('nova nota', data => {
    // Nova nota adicionada, insere no banco
    Firebird.attach(configAcesso, (err, db) => {
      let sql = `INSERT INTO MENSAGEM (DEMENSAGEM) VALUES (?)`
      db.query(sql, [data.nota], (errQuery, data) => {
        if (!errQuery) {
          db.detach()
        } else {
          return
        }
      })
    })
  })

  // Query executada ao conectar o socket
  atualizaDados()

})

const atualizaDados = () => {
  Firebird.attach(configAcesso, (err, db) => {
    let notas = []
    let sql = `SELECT * FROM MENSAGEM ORDER BY 1`
    db.query(sql, (errQuery, data) => {
      if (!errQuery) {
        data.forEach(dados => {
          notas.push(dados.DEMENSAGEM)
        })
        io.emit('notas iniciais', notas)
        db.detach()
        console.log('Sucesso ao consultar no banco')
      } else {
        console.log('Não foi possível consultar no banco')
        return
      }
    })
  })
}