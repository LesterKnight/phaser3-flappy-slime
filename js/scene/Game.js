import Title from "../objects/Title.js"
import Player from "../objects/Player.js"
import Tube from "../objects/Tube.js"

export default class Game extends Phaser.Scene {

    constructor() {
        super({
            key: 'GameScene'
        })
    }

    gameOverAnimation(){
        this.musicMain.stop()
        this.musicGameOver.play()
        this.tubeGroup.setVelocityX(0)
        this.scoreGroup.setVelocityX(0)
    }

    create() {
        this.gameOver = false
        this.musicMain = this.sound.add('coffin', { loop: true })
        this.musicGameOver = this.sound.add('gameover', { loop: true })
        this.musicGameOver.setVolume(0.7)
        this.soundCoin = this.sound.add('coin', { loop: false })
        this.soundCoin.setVolume(0.2)
        this.tileSprite = this.add.tileSprite(0, 0, 320, 224, 'background').setOrigin(0, 0).setScale(3.6)
        this.physics.world.setBounds(0, 0, 480, 800)
        this.title = new Title(this)
        this.player = new Player(this)
        this.player.create()
        this.tubeGroup = this.physics.add.group({ immovable: false, allowGravity: false })
        this.scoreGroup = this.physics.add.group({ immovable: false, allowGravity: false })

        let colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x8b00ff]
        let tintSpeed = 100
        let colorIndex = 0
        
        this.time.addEvent({
            delay: tintSpeed,
            loop: true,
            callback: () => {
                if (this.player.crashed) {
                    this.player.setTint(colors[colorIndex]);
                    colorIndex = (colorIndex + 1) % colors.length;
                }
            }
        })

        this.player.body.world.on('worldbounds', function (body) {
            if (body.gameObject === this) {
                if (!this.crashed){
                    this.crash()
                    this.scene.gameOverAnimation()
                }
            }
        }, this.player)

        this.physics.add.overlap(this.tubeGroup, this.player, handleCollision.bind(this))
        function handleCollision(element1, element2) {
            if(!element1.crashed){
                element1.crash()
                this.gameOverAnimation()
            } 
        }
        this.score = 0
        this.scoreText = this.add.text(160, 16, 'Score: 0', { fontSize: '32px', fill: '#000',fontWeight: 'bold' })
        this.scoreText.setDepth(10)
        this.scoreText.setVisible(false)
        this.physics.add.overlap(this.scoreGroup, this.player, handleCoins.bind(this))
        function handleCoins(element1, element2) {
            //console.log(`element1.x:${element1.x} element2.x${element2.x}`)
            if(element1.x >= element2.x-10&&!element1.crashed){
                element2.destroy()
                this.score++
                this.scoreText.setText('Score: ' + this.score)
                this.soundCoin.play()
            }
                
        }

        this.input.on('pointerdown', () => {
           this.player.click = true
        })
        this.input.on('pointerup', () => {
            this.player.click = false
        }) 
    }

    update() {
        this.player.update()
        if ((this.player.spacebar.isDown ||this.player.click) && !this.player.crashed && !this.run) {//START GAME
                this.run = true
                this.scoreText.setVisible(true)
                this.player.body.setAllowGravity(true)
                this.title.setVisible(false)
                this.musicMain.play()
            
        }
        if (!this.player.crashed) {
            this.tileSprite.tilePositionX += 0.3
        } else {
            this.player.setRotation(this.player.rotation + 0.05)
            if (this.player.isOutOfBounds()) {
                this.run = false
                this.musicGameOver.stop()
                this.player.disable()
                this.scene.restart()
            }
        }

        let tubes = this.tubeGroup.getChildren()
        if (tubes.length == 0 && this.run)
            new Tube(this, 580, 0);
        tubes.forEach(function (childTube) {
            if (childTube.x < 0) {
                childTube.destroy()
            }
            else if (
                childTube.x - childTube.displayWidth < 200 &&
                !childTube.createdNewOne &&
                childTube.y == 0) {
                new Tube(this)
                childTube.createdNewOne = true
            }
        }, this)

    }
}