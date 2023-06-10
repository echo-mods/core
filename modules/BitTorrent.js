const net = require("net");
const bencode = require("bencode");
const crypto = require("crypto");

export class BitTorrentDownloader {
    constructor(torrentFile, savePath) {
        this.torrent = bencode.decode(torrentFile);
        this.infoHash = this.calculateInfoHash();
        this.savePath = savePath;
        this.peers = [];
    }

    calculateInfoHash() {
        const info = bencode.encode(this.torrent.info);
        return crypto.createHash("sha1").update(info).digest();
    }

    start() {
        const trackerUrl = this.torrent.announce.toString();
        const params = {
            info_hash: this.infoHash,
            peer_id: crypto.randomBytes(20),
            port: 6881,
            uploaded: 0,
            downloaded: 0,
            left: this.torrent.info.length,
            compact: 1,
        };
        const announceUrl = `${trackerUrl}?${new URLSearchParams(
            params
        ).toString()}`;

        this.connectToTracker(announceUrl);
    }

    connectToTracker(announceUrl) {
        const url = new URL(announceUrl);
        const socket = net.createConnection(
            Number(url.port),
            url.hostname,
            () => {
                const connectionRequest = {
                    connection_id: 0x41727101980,
                    action: 0, // Connect
                    transaction_id: this.generateTransactionId(),
                };

                const buffer = Buffer.alloc(16);
                buffer.writeUInt32BE(connectionRequest.connection_id, 0);
                buffer.writeUInt32BE(connectionRequest.action, 8);
                buffer.writeUInt32BE(connectionRequest.transaction_id, 12);

                socket.write(buffer);
            }
        );

        socket.on("data", (data) => {
            if (data.length < 16) {
                console.error("Invalid response from tracker");
                socket.end();
                return;
            }

            const action = data.readUInt32BE(0);
            const transactionId = data.readUInt32BE(4);

            if (transactionId !== this.generateTransactionId()) {
                console.error("Invalid transaction ID in tracker response");
                socket.end();
                return;
            }

            if (action === 0) {
                const connectionResponse = {
                    action: data.readUInt32BE(0),
                    transaction_id: data.readUInt32BE(4),
                    connection_id: data.readBigUInt64BE(8),
                };

                const announceRequest = {
                    connection_id: connectionResponse.connection_id,
                    action: 1, // Announce
                    transaction_id: this.generateTransactionId(),
                    info_hash: this.infoHash,
                    peer_id: crypto.randomBytes(20),
                    downloaded: 0,
                    left: this.torrent.info.length,
                    uploaded: 0,
                    event: 0, // None
                    ip: 0,
                    key: 0,
                    num_want: -1,
                    port: 6881,
                };

                const announceBuffer = Buffer.alloc(98);
                announceBuffer.writeUInt32BE(announceRequest.connection_id, 0);
                announceBuffer.writeUInt32BE(announceRequest.action, 8);
                announceBuffer.writeUInt32BE(
                    announceRequest.transaction_id,
                    12
                );
                announceBuffer.write(
                    this.infoHash.toString("binary"),
                    16,
                    20,
                    "binary"
                );
                announceBuffer.write(
                    announceRequest.peer_id.toString("binary"),
                    36,
                    20,
                    "binary"
                );
                announceBuffer.writeUInt32BE(announceRequest.downloaded, 56);
                announceBuffer.writeUInt32BE(announceRequest.left, 64);
                announceBuffer.writeUInt32BE(announceRequest.uploaded, 72);
                announceBuffer.writeUInt32BE(announceRequest.event, 88);
                announceBuffer.writeInt32BE(announceRequest.ip, 92);
                announceBuffer.writeInt32BE(announceRequest.key, 96);
                announceBuffer.writeInt32BE(announceRequest.num_want, 100);
                announceBuffer.writeUInt16BE(announceRequest.port, 104);

                socket.write(announceBuffer);
            } else if (action === 1) {
                const announceResponse = {
                    action: data.readUInt32BE(0),
                    transaction_id: data.readUInt32BE(4),
                    interval: data.readUInt32BE(8),
                    leechers: data.readUInt32BE(12),
                    seeders: data.readUInt32BE(16),
                    peers: [],
                };

                for (let i = 20; i < data.length; i += 6) {
                    const ip = `${data[i]}.${data[i + 1]}.${data[i + 2]}.${
                        data[i + 3]
                    }`;
                    const port = data.readUInt16BE(i + 4);
                    announceResponse.peers.push({ ip, port });
                }

                this.connectToPeers(announceResponse.peers);
            }
        });

        socket.on("error", (error) => {
            console.error("Tracker connection error:", error);
        });
    }

    connectToPeers(peers) {
        for (const peer of peers) {
            const socket = net.createConnection(peer.port, peer.ip, () => {
                console.log(`Connected to peer ${peer.ip}:${peer.port}`);
                this.handshake(socket);
            });

            socket.on("error", (error) => {
                console.error(
                    `Peer connection error (${peer.ip}:${peer.port}):`,
                    error
                );
            });
        }
    }

    handshake(socket) {
        const handshakeBuffer = Buffer.alloc(68);
        handshakeBuffer.writeUInt8(19, 0);
        this.torrent.info_hash.copy(handshakeBuffer, 1);
        crypto.randomBytes(8).copy(handshakeBuffer, 20);
        this.torrent.peer_id.copy(handshakeBuffer, 28);

        socket.write(handshakeBuffer);

        socket.once("data", (data) => {
            if (data.length < 49 || data.readUInt8(0) !== 19) {
                console.error("Invalid handshake response from peer");
                socket.end();
                return;
            }

            const peerHandshake = {
                reserved: data.slice(1, 9),
                info_hash: data.slice(9, 29),
                peer_id: data.slice(29),
            };

            if (!peerHandshake.info_hash.equals(this.infoHash)) {
                console.error("Invalid info hash in handshake response");
                socket.end();
                return;
            }

            this.sendInterested(socket);
        });
    }

    sendInterested(socket) {
        const interestedMessage = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x02]);
        socket.write(interestedMessage);

        socket.once("data", (data) => {
            if (data.length < 5 || data.readUInt8(4) !== 2) {
                console.error(
                    "Peer is not interested or sent an invalid message"
                );
                socket.end();
                return;
            }

            // Start requesting and receiving pieces from the peer
            // This part involves handling 'bitfield', 'have', 'request', 'piece', etc. messages
            // Implementing these functionalities is beyond the scope of this example.
        });
    }

    generateTransactionId() {
        return crypto.randomBytes(4).readUInt32BE(0);
    }
}
