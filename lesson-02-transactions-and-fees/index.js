// Import Solana web3 functionalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Generate a new keypair
    const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();    

    let fromWallet = await connection.getBalance(from.publicKey)
    console.log(`The wallet balance of sender(THEN)) : ${parseInt(fromWallet) / LAMPORTS_PER_SOL}`)

    let toWallet = await connection.getBalance(to.publicKey)   
    console.log(`The wallet balance of receiver (THEN) : ${parseInt(toWallet) / LAMPORTS_PER_SOL}`)

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    fromWallet = await connection.getBalance(from.publicKey)
    console.log(`The wallet balance of sender (NOW) : ${parseInt(fromWallet) / LAMPORTS_PER_SOL}`)
    
    // 50% of the balance
    const halfSols = fromWallet/2

    console.log(`Sending ${parseInt(halfSols) / LAMPORTS_PER_SOL} SOL from sender account into the receiver account..  `)
    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: halfSols
        })
    );   
    
    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    
    console.log(`Transfer amount : ${parseInt(halfSols) / LAMPORTS_PER_SOL} SOL`)

    fromWallet = await connection.getBalance(from.publicKey)

    console.log(`Processing Fees : ${(parseInt(halfSols) / LAMPORTS_PER_SOL) - (parseInt(fromWallet) / LAMPORTS_PER_SOL)}`)
    
    console.log(`The wallet balance of sender (NOW) : ${parseInt(fromWallet) / LAMPORTS_PER_SOL}`)

    toWallet = await connection.getBalance(to.publicKey)   
    console.log(`The wallet balance of receiver (NOW) : ${parseInt(toWallet) / LAMPORTS_PER_SOL}`)
    
    console.log('Signature is', signature);
}

transferSol();
